import { DatabaseClient } from '@/app/lib/clients/DatabaseClient';
import { NextResponse } from 'next/server';

const prisma = DatabaseClient.getInstance();

// Define your scoring weights here
const SCORE_CORRECT = 2;
const SCORE_PODIUM = 1;
const SCORE_INCORRECT = 0;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ predictionFormId: string }> }
)
{
    try
    {
        const resolvedParams = await params;
        const predictionFormId = resolvedParams.predictionFormId;

        // 1. Fetch the official answers
        const answers = await prisma.predictionAnswer.findMany(
        {
            where: { predictionFormId: predictionFormId }
        });

        if (answers.length === 0)
        {
            return NextResponse.json(
                { error: 'No official answers found. Please save answers before grading.' },
                { status: 400 }
            );
        }

        // 2. Build lookup maps for highly efficient O(1) grading
        const exactAnswerMap = new Map<string, number>();
        const podiumMap = new Map<string, Set<number>>();

        for (const ans of answers)
        {
            exactAnswerMap.set(`${ans.event}_${ans.placement}`, ans.actualCuberId);

            if (!podiumMap.has(ans.event))
            {
                podiumMap.set(ans.event, new Set());
            }
            podiumMap.get(ans.event)!.add(ans.actualCuberId);
        }

        // 3. Fetch all submissions and their prediction records
        const submissions = await prisma.predictionSubmission.findMany(
        {
            where: { predictionFormId: predictionFormId },
            include: { predictions: true }
        });

        // 4. Grade everything in memory, bucketing record IDs by outcome
        //    and submission IDs by total score, so we can update in bulk
        //    instead of issuing one statement per row.
        const correctIds: number[] = [];
        const podiumIds: number[] = [];
        const incorrectIds: number[] = [];
        const submissionScoreGroups = new Map<number, number[]>();

        for (const sub of submissions)
        {
            let totalSubmissionScore = 0;

            for (const record of sub.predictions)
            {
                const exactWinnerId = exactAnswerMap.get(`${record.event}_${record.placement}`);
                const eventPodium = podiumMap.get(record.event) || new Set();

                if (record.predictedCuberId === exactWinnerId)
                {
                    correctIds.push(record.id);
                    totalSubmissionScore += SCORE_CORRECT;
                }
                else if (eventPodium.has(record.predictedCuberId))
                {
                    podiumIds.push(record.id);
                    totalSubmissionScore += SCORE_PODIUM;
                }
                else
                {
                    incorrectIds.push(record.id);
                }
            }

            const group = submissionScoreGroups.get(totalSubmissionScore) ?? [];
            group.push(sub.id);
            submissionScoreGroups.set(totalSubmissionScore, group);
        }

        // 5. Build a small, fixed number of batched updateMany operations
        //    (at most 3 for records + one per distinct submission score)
        //    instead of one operation per record/submission.
        const updateOperations = [];

        if (correctIds.length > 0)
        {
            updateOperations.push(
                prisma.predictionRecord.updateMany(
                {
                    where: { id: { in: correctIds } },
                    data: { status: 'CORRECT', score: SCORE_CORRECT }
                })
            );
        }

        if (podiumIds.length > 0)
        {
            updateOperations.push(
                prisma.predictionRecord.updateMany(
                {
                    where: { id: { in: podiumIds } },
                    data: { status: 'PODIUM', score: SCORE_PODIUM }
                })
            );
        }

        if (incorrectIds.length > 0)
        {
            updateOperations.push(
                prisma.predictionRecord.updateMany(
                {
                    where: { id: { in: incorrectIds } },
                    data: { status: 'INCORRECT', score: SCORE_INCORRECT }
                })
            );
        }

        for (const [score, submissionIds] of submissionScoreGroups)
        {
            updateOperations.push(
                prisma.predictionSubmission.updateMany(
                {
                    where: { id: { in: submissionIds } },
                    data: { score: score }
                })
            );
        }

        // 6. Execute all updates in a single, atomic database transaction.
        //    This is now a small, bounded number of statements regardless
        //    of how many submissions/records exist, so it comfortably
        //    fits well within the timeout. The explicit timeout below is
        //    just a safety margin.
        if (updateOperations.length > 0)
        {
            await prisma.$transaction(updateOperations, { timeout: 15000 });
        }

        return NextResponse.json(
            { success: true, message: 'Grading complete!' },
            { status: 200 }
        );
    }
    catch (error)
    {
        console.error('[POST /api/predictions/[id]/grade] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
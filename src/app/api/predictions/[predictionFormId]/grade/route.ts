import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // 4. Prepare the batch update operations
        const updateOperations = [];

        for (const sub of submissions) 
        {
            let totalSubmissionScore = 0;

            for (const record of sub.predictions) 
            {
                const exactWinnerId = exactAnswerMap.get(`${record.event}_${record.placement}`);
                const eventPodium = podiumMap.get(record.event) || new Set();

                let status: 'CORRECT' | 'PODIUM' | 'INCORRECT' = 'INCORRECT';
                let score = SCORE_INCORRECT;

                if (record.predictedCuberId === exactWinnerId) 
                {
                    status = 'CORRECT';
                    score = SCORE_CORRECT;
                } 
                else if (eventPodium.has(record.predictedCuberId)) 
                {
                    status = 'PODIUM';
                    score = SCORE_PODIUM;
                }

                totalSubmissionScore += score;

                updateOperations.push(
                    prisma.predictionRecord.update(
                    {
                        where: { id: record.id },
                        data: 
                        {
                            status: status,
                            score: score
                        }
                    })
                );
            }

            updateOperations.push(
                prisma.predictionSubmission.update(
                {
                    where: { id: sub.id },
                    data: 
                    {
                        score: totalSubmissionScore
                    }
                })
            );
        }

        // 5. Execute all updates in a single, atomic database transaction
        await prisma.$transaction(updateOperations);

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
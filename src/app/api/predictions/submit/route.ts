/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request)
{
    try 
    {
        const payload = await req.json();
        
        const { predictionFormId, userId, wcaId, wantPrize, predictions } = payload;

        // 1. Basic Validation
        if (!predictionFormId || !userId || !predictions || !Array.isArray(predictions)) 
        {
            return NextResponse.json(
                { error: 'Missing required fields' }, 
                { status: 400 }
            );
        }

        const parsedUserId = parseInt(userId, 10);

        // 2. Validate Form Status & Time
        const form = await prisma.predictionForm.findUnique(
        {
            where: { id: predictionFormId }
        });

        if (!form) 
        {
            return NextResponse.json(
                { error: 'Prediction form not found' }, 
                { status: 404 }
            );
        }

        // Added the isLocked check alongside the closeTime check
        if (new Date() > form.closeTime || form.isLocked) 
        {
            return NextResponse.json(
                { error: 'Submissions are strictly closed for this competition.' }, 
                { status: 403 }
            );
        }

        // 3. Flatten the predictions to match the PredictionRecord schema format
        const flatPredictions: any[] = [];

        for (const pred of predictions) 
        {
            if (pred.championId) 
            {
                flatPredictions.push(
                {
                    event: pred.event,
                    placement: 'CHAMPION',
                    predictedCuberId: pred.championId
                });
            }
            if (pred.firstRunnerUpId) 
            {
                flatPredictions.push(
                {
                    event: pred.event,
                    placement: 'FIRST_RUNNER_UP',
                    predictedCuberId: pred.firstRunnerUpId
                });
            }
            if (pred.secondRunnerUpId) 
            {
                flatPredictions.push(
                {
                    event: pred.event,
                    placement: 'SECOND_RUNNER_UP',
                    predictedCuberId: pred.secondRunnerUpId
                });
            }
        }

        // 4. Check if the user already has a submission
        const existingSubmission = await prisma.predictionSubmission.findUnique(
        {
            where: 
            {
                userId_predictionFormId: 
                {
                    predictionFormId: predictionFormId,
                    userId: parsedUserId
                }
            }
        });

        // 5. Execute the Insert/Update Transaction
        const processedSubmission = await prisma.$transaction(async (tx) => 
        {
            if (existingSubmission) 
            {
                // If they already submitted, delete their old individual records first
                await tx.predictionRecord.deleteMany(
                {
                    where: { submissionId: existingSubmission.id }
                });

                // Then update the main submission entry and insert the fresh records
                const updatedSubmission = await tx.predictionSubmission.update(
                {
                    where: { id: existingSubmission.id },
                    data: 
                    {
                        wcaId: wcaId || null,
                        wantsPrize: Boolean(wantPrize),
                        predictions: 
                        {
                            create: flatPredictions
                        }
                    }
                });

                return updatedSubmission;
            } 
            else 
            {
                // If this is their first time submitting, create everything from scratch
                const newSubmission = await tx.predictionSubmission.create(
                {
                    data: 
                    {
                        predictionFormId: predictionFormId,
                        userId: parsedUserId,
                        wcaId: wcaId || null,
                        wantsPrize: Boolean(wantPrize),
                        predictions: 
                        {
                            create: flatPredictions
                        }
                    }
                });

                return newSubmission;
            }
        });

        return NextResponse.json(
            { success: true, submissionId: processedSubmission.id }, 
            { status: 200 }
        );
    } 
    catch (error) 
    {
        console.error('Submission Error:', error);

        return NextResponse.json(
            { error: 'Failed to process submission' }, 
            { status: 500 }
        );
    }
}
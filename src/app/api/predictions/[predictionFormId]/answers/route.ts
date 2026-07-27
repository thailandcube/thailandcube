import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventType, Placement } from '@prisma/client';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ predictionFormId: string }> }
) 
{
    try 
    {
        const resolvedParams = await params;
        const predictionFormId = resolvedParams.predictionFormId;
        
        const body = await request.json();
        const { answers } = body;

        if (!answers || !Array.isArray(answers)) 
        {
            return NextResponse.json(
                { error: 'Invalid payload. Expected an array of answers.' }, 
                { status: 400 }
            );
        }

        // Execute a Prisma Transaction for safety
        await prisma.$transaction(async (tx) => 
        {
            // A. Clear out existing answers for this competition to prevent duplicates
            await tx.predictionAnswer.deleteMany(
            {
                where: 
                {
                    predictionFormId: predictionFormId
                }
            });

            // B. Map the incoming payload to match the database schema
            const newAnswers = answers.map((ans: { event: string; placement: string; actualCuberId: number }) => 
            ({
                predictionFormId: predictionFormId,
                event: ans.event as EventType,
                placement: ans.placement as Placement,
                actualCuberId: ans.actualCuberId
            }));

            // C. Insert the fresh batch of answers
            if (newAnswers.length > 0) 
            {
                await tx.predictionAnswer.createMany(
                {
                    data: newAnswers
                });
            }
        });

        return NextResponse.json(
            { success: true, message: 'Answers saved successfully' }, 
            { status: 200 }
        );
    } 
    catch (error) 
    {
        console.error('[POST /api/predictions/[id]/answers] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}
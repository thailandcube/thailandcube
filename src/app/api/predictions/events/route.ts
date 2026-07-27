import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ predictionFormId: string }> }
) 
{
    try 
    {
        // 1. Await and parse the dynamic route parameter
        const resolvedParams = await params;
        const formId = parseInt(resolvedParams.predictionFormId, 10);

        if (isNaN(formId)) 
        {
            return NextResponse.json(
                { error: 'Invalid predictionFormId' },
                { status: 400 }
            );
        }

        // 2. Execute the query using Prisma's built-in distinct feature
        const records = await prisma.predictionEventCompetitor.findMany({
            where: {
                predictionFormId: formId
            },
            select: {
                event: true
            },
            distinct: ['event']
        });

        // 3. Extract the enum values out of the object array into a clean string array
        // Converts [{ event: 'E333' }, { event: 'E222' }] -> ['E333', 'E222']
        const uniqueEvents = records.map(record => record.event);

        return NextResponse.json(uniqueEvents, { status: 200 });
    } 
    catch (error) 
    {
        console.error('Failed to fetch distinct events:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
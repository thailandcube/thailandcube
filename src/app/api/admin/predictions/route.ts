import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request)
{
    try 
    {
        const forms = await prisma.predictionForm.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(forms, { status: 200 });
    } 
    catch (error) 
    {
        console.error('Failed to fetch prediction forms:', error);

        return NextResponse.json(
            { error: 'Failed to fetch prediction forms' },
            { status: 500 }
        );
    }
}
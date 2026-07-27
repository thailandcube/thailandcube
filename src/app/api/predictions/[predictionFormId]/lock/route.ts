import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ predictionFormId: string }> }
) 
{
    try 
    {
        const resolvedParams = await params;
        const predictionFormId = resolvedParams.predictionFormId;
        
        const body = await request.json();
        const { isLocked } = body;

        if (typeof isLocked !== 'boolean') 
        {
            return NextResponse.json(
                { error: 'Invalid payload. Expected isLocked as boolean.' }, 
                { status: 400 }
            );
        }

        await prisma.predictionForm.update(
        {
            where: { id: predictionFormId },
            data: { isLocked: isLocked }
        });

        return NextResponse.json(
            { success: true, message: 'Form lock status updated successfully' }, 
            { status: 200 }
        );
    } 
    catch (error) 
    {
        console.error('[PATCH /api/predictions/[id]/lock] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}
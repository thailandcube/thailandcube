import { getAllCubers } from '@/app/actions/predictions';
import { EventCodeToPrismaMap } from '@/lib/EnumMapping';
import { CuberData } from '@/model/predictions/CuberData';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request)
{
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer '))
    {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    try 
    {
        const payload = await req.json();

        if (!payload?.competitionId || !payload?.name || !payload?.openTime || !payload?.closeTime) 
        {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log('Creating form for:', payload.competitionId);

        const allRegisteredCubers: Record<string, CuberData[]> | undefined = await getAllCubers({competitionId: payload.competitionId, isThaiOnly: payload.isThaiOnly});

        if (!allRegisteredCubers || Object.keys(allRegisteredCubers).length === 0)
        {
            throw new Error('No competitors found for this competition.');
        }

        // 3. Execute the Prisma Transaction
        const createdForm = await prisma.$transaction(async (tx) => 
        {
            // A. Create the parent form
            const form = await tx.predictionForm.create({
                data: {
                    id: payload.competitionId,
                    name: payload.name,
                    isThaiOnly: Boolean(payload.isThaiOnly),
                    openTime: new Date(payload.openTime),
                    closeTime: new Date(payload.closeTime),
                }
            });

            // B. Prepare the bulk insert array
            const competitorInserts = [];

            for (const [eventId, cubers] of Object.entries(allRegisteredCubers)) 
            {
                const prismaEvent = EventCodeToPrismaMap[eventId as keyof typeof EventCodeToPrismaMap];
                
                // Skip events that aren't in your schema
                if (!prismaEvent) continue; 

                for (const cuber of cubers) 
                {
                    competitorInserts.push({
                        predictionFormId: form.id,
                        name: cuber.name,
                        wcaId: cuber.wcaId,
                        countryIso2: cuber.countryIso2,
                        event: prismaEvent,
                        pos: cuber.pos ?? 999,
                    });
                }
            }

            // C. Bulk insert all competitors
            await tx.predictionEventCompetitor.createMany({
                data: competitorInserts,
                skipDuplicates: true // Prevents crashing if WCA data had a weird duplicate
            });

            return form;
        });

        return NextResponse.json({ success: true, formId: createdForm.id }, { status: 200 });
    } 
    catch (err) 
    {
        console.error(err);

        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }
}
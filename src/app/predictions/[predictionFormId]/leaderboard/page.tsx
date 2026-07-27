import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PredictionLeaderboard from '@/app/components/PredictionLeaderboard';

export default async function LeaderboardPage({ 
    params 
}: { 
    params: Promise<{ predictionFormId: string }> 
}) 
{
    const resolvedParams = await params;
    const formId = resolvedParams.predictionFormId;

    // Fetch the form, submissions, and the nested User -> Competitor relation to get the name
    const form = await prisma.predictionForm.findUnique({
        where: { id: formId },
        include: {
            submissions: {
                orderBy: {
                    score: 'desc'
                },
                include: {
                    user: {
                        include: {
                            competitor: true
                        }
                    },
                    predictions: {
                        include: {
                            predictedCuber: true
                        }
                    }
                }
            }
        }
    });

    if (!form) 
    {
        notFound();
    }

    return (
        <div className='p-4 md:p-8 w-full max-w-5xl mx-auto'>
            <PredictionLeaderboard form={form} submissions={form.submissions} />
        </div>
    );
}
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PredictionDashboardAdmin from '@/app/components/PredictionDashboardAdmin';

export default async function PredictionFormAdminPage({ 
    params 
}: { 
    params: Promise<{ predictionFormId: string }> 
}) 
{
    const resolvedParams = await params;
    const formId = resolvedParams.predictionFormId;

    // Deep fetch for all admin dashboard requirements
    const form = await prisma.predictionForm.findUnique({
        where: { id: formId },
        include: {
            _count: {
                select: {
                    submissions: true,
                    cubers: true
                }
            },
            // 1. MUST include answers to pre-fill the form
            answers: true, 
            
            // 2. MUST include cubers to populate the dropdown menus (Fixes the iterable error)
            cubers: true,  
            
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
        <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
            <PredictionDashboardAdmin form={form} />
        </div>
    );
}
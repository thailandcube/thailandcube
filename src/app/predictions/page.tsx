import { prisma } from '@/lib/prisma';
import PredictionsList from '@/app/components/PredictionsList';

export default async function PredictionsDashboardPage() 
{
    const forms = await prisma.predictionForm.findMany(
    {
        orderBy: 
        {
            closeTime: 'desc'
        }
    });

    return (
        <div className='p-6 w-full max-w-7xl mx-auto'>
            <PredictionsList forms={forms} />
        </div>
    );
}
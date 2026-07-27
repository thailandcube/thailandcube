import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PredictionFormClient from '@/app/components/PredictionFormClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust this import path to your actual NextAuth config file

export default async function PublicPredictionFormPage({ 
    params 
}: { 
    params: Promise<{ predictionFormId: string }> 
}) 
{
    const resolvedParams = await params;
    const formId = resolvedParams.predictionFormId;

    // 1. Get the current user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    // 2. Fetch the form and the entire roster of competitors
    const form = await prisma.predictionForm.findUnique(
    {
        where: { id: formId },
        include: 
        {
            cubers: true 
        }
    });

    if (!form) 
    {
        notFound();
    }

    // 3. Fetch the user's existing submission and their records
    let existingSubmission = null;
    
    if (userId) 
    {
        existingSubmission = await prisma.predictionSubmission.findUnique(
        {
            where: 
            {
                userId_predictionFormId: 
                {
                    userId: userId,
                    predictionFormId: formId
                }
            },
            include: 
            {
                predictions: true // Include the nested prediction records to pre-fill the form
            }
        });
    }

    return (
        <div className='p-4 md:p-8 w-full max-w-3xl mx-auto'>
            {/* Pass the existing submission to your client component */}
            <PredictionFormClient 
                form={form} 
                roster={form.cubers} 
                existingSubmission={existingSubmission} 
            />
        </div>
    );
}
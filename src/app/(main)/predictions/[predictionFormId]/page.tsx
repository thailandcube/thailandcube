import { getPredictionFormById, getUserExistingSubmission } from '@/app/actions/predictions';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import PredictionForm from './_components/PredictionForm';

export default async function PredictionFormPage({ params }: { params: Promise<{ predictionFormId: string }> }) {
  const resolvedParams = await params;
  const formId = resolvedParams.predictionFormId;

  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const response = await getPredictionFormById(formId);

  if (!response.success)
    notFound();

  const formData = response.data;

  let existingSubmission = null;
  let existingSubmissionResponse = null;

  if (userId)
    existingSubmissionResponse = await getUserExistingSubmission(userId, formData.id);

  if (existingSubmissionResponse?.success)
    existingSubmission = existingSubmissionResponse?.data;

  return (
    <>
      <div className='p-4 md:p-8 w-full max-w-3xl mx-auto'>
        <PredictionForm 
          form={formData} 
          roster={formData.cubers} 
          existingSubmission={existingSubmission} 
        />
      </div>
    </>
  );
}
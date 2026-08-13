import { getPredictionFormLeaderboardById } from '@/app/actions/predictions';
import { notFound } from 'next/navigation';
import PredictionLeaderboard from './_components/PredictionLeaderboard';

export default async function PredictionLeaderboardPage({ params }: { params: Promise<{ predictionFormId: string }> }) {
  const resolvedParams = await params;
  const formId =  resolvedParams.predictionFormId;

  const response = await getPredictionFormLeaderboardById(formId);

  if (!response.success)
    notFound();

  const form = response.data;

  return (
    <div className='p-4 md:p-8 w-full max-w-6xl mx-auto'>
      <PredictionLeaderboard form={form} submissions={form.submissions}/>
    </div>
  );
}
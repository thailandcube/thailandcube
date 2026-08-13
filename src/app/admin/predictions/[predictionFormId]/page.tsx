import { getPredictionFormById } from '@/app/actions/predictions';
import { notFound } from 'next/navigation';
import AdminPredictionDashboard from './_components/AdminPredictionDashboard';

export default async function AdminPredictionViewPage({ params }: { params: Promise<{ predictionFormId: string }>}) {
  const resolvedParams = await params;
  const formId = resolvedParams.predictionFormId;

  const form = await getPredictionFormById(formId, true);

  if (!form.success)
    notFound();

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      <AdminPredictionDashboard form={form.data} />
    </div>
  )
}
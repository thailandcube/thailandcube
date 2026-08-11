import { getAllPredictionForms } from '@/app/actions/predictions';
import { notFound } from 'next/navigation';
import PredictionsList from './_components/PredictionsList';

export default async function PredictionsPage() {
  const response = await getAllPredictionForms();

  if (!response.success)
    notFound();

  const forms = response.data;

  return (
    <>
      <div className='p-6 w-full max-w-7xl mx-auto'>
        <PredictionsList forms={forms!}/>
      </div>
    </>
  );
}
import { getCompetitionById } from '@/app/actions/competitions';
import CompetitionDetails from './_components/CompetitionDetails';
import { notFound } from 'next/navigation';
import CompetitionInfoResults from './_components/CompetitionInfoResults';

export default async function CompetitionInfoPage({ params }: { params: Promise<{competitionId: string}> }) {
  const competitionId = (await params).competitionId;

  const competitionDetails = await getCompetitionById(competitionId);

  if (!competitionDetails)
    notFound();

  return (
    <div className='mx-auto w-full max-w-7xl px-4 flex flex-col gap-10 my-8 sm:px-6 lg:px-8 md:my-12 md:gap-16'>
      <CompetitionDetails competition={competitionDetails}/>
      <CompetitionInfoResults competition={competitionDetails}/>
    </div>
  );
}
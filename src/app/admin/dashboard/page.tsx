import { getAllCompetitions } from '@/app/actions/competitions';
import CompetitionManager from './_components/CompetitionManager';

export default async function AdminDashboardPage() {
  const competitionsData = await getAllCompetitions();

  return (
    <>
      <h1 className='text-4xl font-bold mb-6'>Manage Competitions</h1>
      <CompetitionManager data={competitionsData}/>
    </>
  );
}
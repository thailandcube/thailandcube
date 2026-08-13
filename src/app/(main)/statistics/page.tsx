import { getAllNationalRecords } from '@/app/actions/national-records';
import StatisticsContent from './_components/StatisticsContent';
import { auth } from '@/auth';

export default async function StatisticsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'SUPERUSER';

  const rawNationalRecords = await getAllNationalRecords();
  let nationalRecords = [];
  if (rawNationalRecords)
    nationalRecords = JSON.parse(JSON.stringify(rawNationalRecords.data));

  return (
    <>
      <StatisticsContent nationalRecords={nationalRecords} isAdmin={isAdmin}/>
      {/* { 
        isAdmin ? 
      } */}
    </>
  );
}
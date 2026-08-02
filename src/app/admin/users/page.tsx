import { getAllUsers } from '@/app/actions/users';
import UsersTable from './_components/UsersTable';

export default async function DashboardUserPage() {
  const usersData = await getAllUsers();

  return (
    <>
      <UsersTable usersData={usersData}/>
    </>
  );
}
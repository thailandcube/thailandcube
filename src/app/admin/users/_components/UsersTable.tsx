'use client';

import {
  Table,
  Select,
  Button,
  ListBox,
  toast,
} from '@heroui/react';
import { Competitor, Role, User } from '@/generated/prisma/client';
import { useSession } from 'next-auth/react';
import { updateUserRole } from '@/app/actions/users';
import { useRouter } from 'next/navigation';

interface ExtendedUser extends User {
  competitor: Competitor | null;
}

const ROLES: Role[] = [
  'USER',
  'ADMIN',
  'SUPERUSER',
];

export default function UsersTable({ usersData }: { usersData: ExtendedUser[] }) {
  const { data: session, status } = useSession();
  
  const router = useRouter();

  const handleRoleChange = async (userId: number, currentRole: Role, newRole: Role) => {
    if (currentRole === newRole)
      return;

    if (session?.user.role !== 'SUPERUSER') {
      toast.danger('Only superusers can edit roles.');
      return;
    }

    try {
      const result = await updateUserRole(userId, newRole);

      if (result.success) {
        toast.success('Successfully updated role.');

        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update role', error);
    }
  }

  const renderTableRow = usersData.map((user) => (
    <Table.Row key={user.id}>
      <Table.Cell>{user?.competitor?.name ?? 'N/A'}</Table.Cell>
      <Table.Cell><span className={`fi fi-${user?.competitor?.region.toLowerCase()}`}></span></Table.Cell>
      <Table.Cell>
        <Select
          value={user.role}
          onChange={(val) => {
            if (val) 
              handleRoleChange(user.id, user.role, val as Role);
          }}
          isDisabled={user.role === 'SUPERUSER' || (session?.user.id ? Number.parseInt(session?.user.id) === user.id : false)}
        >
          <Select.Trigger>
            <Select.Value/>
            <Select.Indicator/>
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {
                ROLES.map((role) => (
                  <ListBox.Item key={role} id={role}>
                    {role}
                  </ListBox.Item>
                ))
              }
            </ListBox>
          </Select.Popover>
        </Select>
      </Table.Cell>
    </Table.Row>
  ))

  return (
    <>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label='Users Table'>
            <Table.Header>
              <Table.Column allowsSorting isRowHeader>
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Name
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column>Region</Table.Column>
              <Table.Column>Role</Table.Column>
            </Table.Header>
            <Table.Body>
              {renderTableRow}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </>
  );
}
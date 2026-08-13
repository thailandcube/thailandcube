'use client';

import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Chip, 
  Spinner,
  Button,
  Link,
  buttonVariants
} from '@heroui/react';
import { getAllPredictionForms } from '@/app/actions/predictions';
import { PredictionForm } from '@/generated/prisma/client';
import { Eye, PencilToSquare, TrashBin } from '@gravity-ui/icons';


export default function AdminPredictionFormsList() {
  const [forms, setForms] = useState<PredictionForm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await getAllPredictionForms();
        
        if (!response.success) 
          throw new Error('Failed to fetch prediction forms');
        
        const data = response.data!;
        setForms(data);
      } 
      catch (error) {
        console.error('Error fetching forms:', error);
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []);

  const getStatusChip = (openTime: string, closeTime: string) => {
    const now = new Date();
    const open = new Date(openTime);
    const close = new Date(closeTime);

    if (now < open) 
      return <Chip color='warning' variant='soft'>Upcoming</Chip>;
    else if (now >= open && now <= close) 
      return <Chip color='success' variant='soft'>Active</Chip>;
    else 
      return <Chip color='danger' variant='soft'>Closed</Chip>;
  };

  return (
    <div className='p-6 w-full max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Prediction Games</h1>
        {/* <Button color='primary' variant='flat'>
          + New Game
        </Button> */}
      </div>
        
      <Table aria-label='List of all prediction forms' className='min-w-full'>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Column isRowHeader>COMPETITION ID</Table.Column>
              <Table.Column>NAME</Table.Column>
              <Table.Column>STATUS</Table.Column>
              <Table.Column>ROSTER LIMIT</Table.Column>
              <Table.Column>ACTIONS</Table.Column>
            </Table.Header>
            <Table.Body 
              // isPending={isLoading} 
              // loadingContent={<Spinner label='Loading forms...' />}
              renderEmptyState={() =>
                <p className='text-2xl font-semibold text-center'>No prediction forms found.</p>
              }
            >
              {
                forms.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell className='font-medium'>{item.id}</Table.Cell>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{getStatusChip(item.openTime.toDateString(), item.closeTime.toDateString())}</Table.Cell>
                    <Table.Cell>
                      {item.isThaiOnly ? (
                        <Chip color='default' variant='soft'>Thai</Chip>
                      ) : (
                        <Chip color='default' variant='soft'>None</Chip>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className='flex gap-2'>
                        <Button size='sm' variant='primary' isIconOnly isDisabled>
                          <PencilToSquare/>
                        </Button>
                        <Button size='sm' variant='danger' isIconOnly isDisabled>
                          <TrashBin/>
                        </Button>
                        <Link href={`/admin/predictions/${item.id}`} className={buttonVariants({variant: 'primary', size: 'sm', isIconOnly: true})}>
                          <Eye/>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              }
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
};
'use client';

import React, { useEffect, useState } from 'react';
import { 
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell, 
    Chip, 
    Spinner,
    Button,
    Link
} from '@heroui/react';

export interface PredictionForm 
{
    id: number;
    competitionId: string;
    name: string;
    isThaiOnly: boolean;
    openTime: string;
    closeTime: string;
}

const PredictionFormsListAdmin = () => 
{
    const [forms, setForms] = useState<PredictionForm[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => 
    {
        const fetchForms = async () => 
        {
            try 
            {
                // Adjust this URL if your GET route is located elsewhere
                const response = await fetch('/api/admin/predictions');
                
                if (!response.ok) 
                {
                    throw new Error('Failed to fetch prediction forms');
                }
                
                const data = await response.json();
                setForms(data);
            } 
            catch (error) 
            {
                console.error('Error fetching forms:', error);
            } 
            finally 
            {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, []);

    const getStatusChip = (openTime: string, closeTime: string) => 
    {
        const now = new Date();
        const open = new Date(openTime);
        const close = new Date(closeTime);

        if (now < open) 
        {
            return <Chip color='warning' variant='flat'>Upcoming</Chip>;
        } 
        else if (now >= open && now <= close) 
        {
            return <Chip color='success' variant='flat'>Active</Chip>;
        } 
        else 
        {
            return <Chip color='default' variant='flat'>Closed</Chip>;
        }
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
                <TableHeader>
                    <TableColumn>COMPETITION ID</TableColumn>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ROSTER LIMIT</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody 
                    items={forms} 
                    isLoading={isLoading} 
                    loadingContent={<Spinner label='Loading forms...' />}
                    emptyContent='No prediction forms found.'
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell className='font-medium'>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{getStatusChip(item.openTime, item.closeTime)}</TableCell>
                            <TableCell>
                                {item.isThaiOnly ? (
                                    <Chip color='secondary' variant='dot'>Thai Only</Chip>
                                ) : (
                                    <Chip color='default' variant='dot'>None</Chip>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className='flex gap-2'>
                                    <Button size='sm' variant='bordered'>
                                        Edit
                                    </Button>
                                    <Button size='sm' color='danger' variant='flat'>
                                        Delete
                                    </Button>
                                    <Button href={`/admin/predictions/${item.id}`} size='sm' color='primary' variant='flat' as={Link}>
                                        View
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default PredictionFormsListAdmin;
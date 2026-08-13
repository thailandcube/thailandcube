'use client';

import React from 'react';
import 
{ 
    Card, 
    CardHeader, 
    CardBody, 
    CardFooter, 
    Chip, 
    Button, 
    Divider 
} from '@heroui/react';
import Link from 'next/link';
import { PredictionForm } from '@prisma/client';

interface Props 
{
    forms: PredictionForm[];
}

const PredictionsList = ({ forms }: Props) => 
{
    const now = new Date();

    return (
        <>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold'>Prediction Games</h1>
                <p className='text-default-500 mt-2'>
                    Test your psych sheet knowledge and predict the podiums for upcoming WCA competitions.
                </p>
            </div>

            {forms.length === 0 ? (
                <Card className='text-center py-12'>
                    <CardBody>
                        <p className='text-default-500'>No prediction games are currently available.</p>
                    </CardBody>
                </Card>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {forms.map((form) => 
                    {
                        const openTime = new Date(form.openTime);
                        const closeTime = new Date(form.closeTime);
                        
                        const isUpcoming = now < openTime;
                        const isClosed = now > closeTime;
                        const isActive = now >= openTime && now <= closeTime;

                        let statusChip;
                        
                        if (isUpcoming) 
                        {
                            statusChip = <Chip color='warning' variant='flat' size='sm'>Upcoming</Chip>;
                        } 
                        else if (isActive) 
                        {
                            statusChip = <Chip color='success' variant='flat' size='sm'>Open</Chip>;
                        } 
                        else 
                        {
                            statusChip = <Chip color='default' variant='flat' size='sm'>Closed</Chip>;
                        }

                        return (
                            <Card key={form.id} className='flex flex-col h-full'>
                                <CardHeader className='flex flex-col items-start gap-2 pt-6 px-6'>
                                    <div className='flex justify-between items-start w-full gap-4'>
                                        <h2 className='text-xl font-bold leading-tight'>{form.name}</h2>
                                        {statusChip}
                                    </div>
                                    {form.isThaiOnly && (
                                        <Chip color='secondary' variant='dot' size='sm'>
                                            TH Cuber Names Only
                                        </Chip>
                                    )}
                                </CardHeader>
                                
                                <CardBody className='px-6 py-4 flex-grow'>
                                    <div className='flex flex-col gap-3 text-sm'>
                                        <div>
                                            <span className='text-default-500 text-xs font-semibold tracking-wider'>OPENS</span>
                                            <p className='font-medium'>{openTime.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className='text-default-500 text-xs font-semibold tracking-wider'>CLOSES</span>
                                            <p className='font-medium'>{closeTime.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardBody>

                                <Divider />

                                <CardFooter className='px-6 py-4'>
                                    <div className='flex grid grid-cols-2 gap-4'>
                                        <Button 
                                            as={Link} 
                                            href={`/predictions/${form.id}`}
                                            color={isActive ? 'primary' : 'default'}
                                            variant={isActive ? 'solid' : 'flat'}
                                            className='w-full font-semibold'
                                        >
                                            {isActive ? 'Play Now' : 'View Details'}
                                        </Button>
                                        <Button 
                                            as={Link} 
                                            href={`/predictions/${form.id}/leaderboard`}
                                            color='secondary'
                                            variant='flat'
                                            className='w-full font-semibold'
                                        >
                                            Leaderboard
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default PredictionsList;
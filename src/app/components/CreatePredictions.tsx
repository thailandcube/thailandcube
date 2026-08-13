/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
    Input, 
    Button, 
    Switch, 
    Card, 
    CardHeader, 
    CardBody, 
    Divider, 
    addToast
} from '@heroui/react';
import { useSession } from 'next-auth/react';

const CreatePredictions = () => 
{
    const { data: session, status } = useSession();
    const [competitionId, setCompetitionId] = useState('');
    const [name, setName] = useState('');
    const [isThaiOnly, setIsThaiOnly] = useState(false);
    
    // New date/time states
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => 
    {
        e.preventDefault();
        setIsLoading(true);

        if (status !== 'authenticated')
        {
            alert('You must be logged in');
            return;
        }

        const accessToken = (session as any)?.accessToken;

        if (!accessToken)
        {
            alert('Missing WCA access token');
            return;
        }

        try 
        {
            const response = await fetch('/api/admin/predictions/create', 
                {
                    method: 'POST',
                    headers:
                    {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        competitionId,
                        name,
                        isThaiOnly,
                        openTime,  // e.g., "2026-05-26T12:00"
                        closeTime
                    })
                }
            );

            if (!response.ok) 
            {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit form');
            }

            addToast({title: 'Success!', description: `Prediction Forms ${name} is created.`, color: 'success'});
        } 
        catch (error) 
        {
            console.error('Failed to create prediction form:', error);
        } 
        finally 
        {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex justify-center p-6'>
            <Card className='w-full max-w-xl'>
                <CardHeader className='flex flex-col items-start px-6 pt-6 pb-4'>
                    <h2 className='text-2xl font-bold'>Create Prediction Game</h2>
                    <p className='text-default-500 text-sm mt-1'>
                        Input a WCA ID to automatically fetch the psych sheet and generate the top seeds.
                    </p>
                </CardHeader>
                
                <Divider />
                
                <CardBody className='px-6 py-6'>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                        <Input
                            isRequired
                            label='Competition ID'
                            placeholder='e.g., ThailandChampionship2026'
                            description='The exact ID used on the WCA website.'
                            value={competitionId}
                            onValueChange={setCompetitionId}
                            variant='bordered'
                            labelPlacement='outside-top'
                        />

                        <Input
                            isRequired
                            label='Form Title'
                            placeholder='e.g., Thailand Championship 2026 Predictions'
                            value={name}
                            onValueChange={setName}
                            variant='bordered'
                            labelPlacement='outside-top'
                        />

                        <div className='flex gap-4'>
                            <Input
                                isRequired
                                type='datetime-local'
                                label='Submissions Open'
                                value={openTime}
                                onValueChange={setOpenTime}
                                variant='bordered'
                                labelPlacement='outside-top'
                            />
                            <Input
                                isRequired
                                type='datetime-local'
                                label='Submissions Close'
                                value={closeTime}
                                onValueChange={setCloseTime}
                                variant='bordered'
                                labelPlacement='outside-top'
                            />
                        </div>

                        <div className='flex items-center justify-between p-4 border border-default-200 rounded-medium'>
                            <div className='flex flex-col gap-1'>
                                <span className='text-sm font-medium'>Thai Cubers Only</span>
                                <span className='text-xs text-default-500'>
                                    Filter the competitors roster to only Thai competitors
                                </span>
                            </div>
                            <Switch 
                                isSelected={isThaiOnly} 
                                onValueChange={setIsThaiOnly} 
                                color='success'
                            />
                        </div>

                        <Button 
                            type='submit' 
                            color='primary' 
                            isLoading={isLoading}
                            className='mt-2 font-medium'
                        >
                            Generate Form & Fetch WCIF
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}

export default CreatePredictions;
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  Input,
  Button, 
  Switch,
  Card,
  Separator,
  toast,
  Label,
  Description
} from '@heroui/react';
import { useSession } from 'next-auth/react';
import { createNewPredictionForm } from '@/app/actions/predictions';
import { useRouter } from 'next/navigation';

export default function CreatePredictions() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const [competitionId, setCompetitionId] = useState('');
  const [name, setName] = useState('');
  const [isThaiOnly, setIsThaiOnly] = useState(false);
  
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (status !== 'authenticated') {
      alert('You must be logged in');
      setIsLoading(false);
      return;
    }

    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      alert('Missing WCA access token');
      setIsLoading(false);
      return;
    }

    try {
      const result = await createNewPredictionForm({
        payload: {
          id: competitionId,
          name,
          isThaiOnly,
          openTime: new Date(openTime),
          closeTime: new Date(closeTime),
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit form');
      }

      toast.success('Success!', {description: `Prediction Forms ${name} is created.`});

      router.refresh();
    } 
    catch (error) {
      console.error('Failed to create prediction form:', error);
      toast.danger('Error', {description: 'Failed to create prediction form.'});
    } 
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center p-4 sm:p-6 min-h-screen'>
      <Card className='w-full max-w-xl h-fit shadow-sm sm:shadow-md'>
        <Card.Header className='flex flex-col items-start px-4 sm:px-6 pt-6 pb-4'>
          <h2 className='text-xl sm:text-2xl font-bold'>Create Prediction Game</h2>
          <p className='text-default-500 text-xs sm:text-sm mt-1'>
            Input a WCA ID to automatically fetch the psych sheet and generate the top seeds.
          </p>
        </Card.Header>
        
        <Separator/>
        
        <Card.Content className='px-4 sm:px-6 py-6'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            
            <div className='flex flex-col gap-1.5'>
              <Label>Competition ID</Label>
              <Input
                required
                placeholder='e.g. ThailandChampionship2026'
                value={competitionId}
                onChange={(event) => setCompetitionId(event.target.value)}
              />
              <Description>The exact ID used on the WCA website.</Description>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label>Form Title</Label>
              <Input
                required
                placeholder='e.g. Thailand Championship 2026 Predictions'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            {/* Responsive Flex wrapper for Date/Time inputs */}
            <div className='flex flex-col sm:flex-row gap-6 sm:gap-4'>
              <div className='flex flex-col gap-1.5 w-full'>
                <Label>Submissions Open</Label>
                <Input
                  required
                  type='datetime-local'
                  value={openTime}
                  onChange={(event) => setOpenTime(event.target.value)}
                />
              </div>
              <div className='flex flex-col gap-1.5 w-full'>
                <Label>Submissions Close</Label>
                <Input
                  required
                  type='datetime-local'
                  value={closeTime}
                  onChange={(event) => setCloseTime(event.target.value)}
                />
              </div>
            </div>

            <div className='flex items-center justify-between p-4 border border-default-200 rounded-medium mt-2'>
                <div className='flex flex-col gap-1 pr-4'>
                    <span className='text-sm font-medium'>Thai Cubers Only</span>
                    <span className='text-xs text-default-500 leading-relaxed'>
                      Filter the competitors roster to only Thai competitors
                    </span>
                </div>
                <Switch 
                  isSelected={isThaiOnly} 
                  onChange={setIsThaiOnly} 
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb/>
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
            </div>

            <Button 
              type='submit' 
              isPending={isLoading}
              className='mt-2 font-medium w-full sm:w-auto sm:self-end'
            >
              Generate Form & Fetch WCIF
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
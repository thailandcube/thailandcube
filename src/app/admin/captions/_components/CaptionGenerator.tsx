'use client';

import { generateCaption } from '@/app/utils/AnnouncementCaption';
import { WCIF } from '@/types/wcif/WCIF';
import { Button, Code, Input, Label } from '@heroui/react';
import { useState } from 'react';

export default function CaptionGenerator() {
  const [compId, setCompId] = useState('');
  const [wcif, setWCIF] = useState<WCIF>();
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const fetchWCIF = async () => {
    if (!compId.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${compId.trim()}/wcif/public`);
      
      if (response.ok) {
        const data = await response.json();
        setWCIF(data);
        setCaption(generateCaption(data));
      } else {
        setError('Competition not found or failed to fetch.');
        setWCIF(undefined);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('An error occurred while fetching data.');
      setWCIF(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!caption) return;
    navigator.clipboard.writeText(caption);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className='flex flex-col items-center justify-center w-full p-4 sm:p-8'>
      <div className='w-full max-w-2xl text-center mb-8'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-2'>
          Caption Generator
        </h1>
        <p className='text-default-500 text-sm sm:text-base'>
          Generate announcement captions for WCA Competitions
        </p>
      </div>

      <div className='w-full max-w-md bg-default-50 p-6 rounded-2xl shadow-sm border border-default-100 mb-8'>
        <div className='flex flex-col gap-4'>
          <div>
            <Label className='mb-2 block text-sm font-medium'>
              WCA Competition ID
            </Label>
            <Input 
              placeholder='e.g. ThailandChampionship2025'
              value={compId}
              onChange={(event) => setCompId(event.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWCIF()}
              disabled={isLoading}
              className='w-full'
            />
          </div>
          
          {error && (
            <p className='text-danger text-sm'>{error}</p>
          )}

          <Button 
            variant='primary' 
            onPress={fetchWCIF} 
            isPending={isLoading}
            className='w-full font-medium'
          >
            {isLoading ? 'Fetching WCIF...' : 'Get WCIF'}
          </Button>
        </div>
      </div>

      {wcif && caption && (
        <div className='w-full max-w-2xl border border-default-200 rounded-xl shadow-md overflow-hidden animate-fade-in'>
          <div className='flex justify-between items-center bg-default-100 px-4 py-3 sm:px-6 border-b border-default-200'>
            <span className='text-sm sm:text-base font-semibold text-default-700 truncate mr-4'>
              Caption For {wcif.name}
            </span>
            <Button 
              variant={isCopied ? 'primary' : 'outline'} 
              size='sm' 
              onPress={handleCopy}
              className='min-w-20'
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className='p-4 sm:p-6 bg-white'>
            <Code className='whitespace-pre-wrap block w-full text-left text-sm sm:text-base p-4 bg-default-50 rounded-lg'>
              {caption}
            </Code>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import {
  Card,
  Chip,
  Separator,
  buttonVariants,
  Link,
} from '@heroui/react';
import { PredictionForm } from '@/generated/prisma/client';
import { useTranslations } from 'next-intl';

export default function PredictionsList({ forms }: { forms: PredictionForm[] }) {
  const t = useTranslations('Predictions');

  const now = new Date();

  return (
    <>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{t('title')}</h1>
        <p className='text-default-500 mt-2'>
          {t('subtitle')}
        </p>
      </div>

      {forms.length === 0 ? 
        (
          <Card className='text-center py-12'>
            <Card.Content>
                <p className='text-default-500'>{t('no_predictions')}</p>
            </Card.Content>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {forms.map((form) => {
              const openTime = new Date(form.openTime);
              const closeTime = new Date(form.closeTime);
              
              const isUpcoming = now < openTime;
              const isClosed = now > closeTime;
              const isActive = now >= openTime && now <= closeTime;

              let statusChip;
              
              if (isUpcoming) 
                statusChip = <Chip color='warning' variant='soft' size='sm'>{t('status.upcoming')}</Chip>;
              else if (isActive) 
                statusChip = <Chip color='success' variant='soft' size='sm'>{t('status.open')}</Chip>;
              else 
                statusChip = <Chip color='danger' variant='soft' size='sm'>{t('status.closed')}</Chip>;

              return (
                <Card key={form.id} className='flex flex-col h-full'>
                  <Card.Header className='flex flex-col items-start gap-2 pt-6 px-6'>
                    <div className='flex justify-between items-start w-full gap-4'>
                      <h2 className='text-xl font-bold leading-tight'>{form.name}</h2>
                      {statusChip}
                    </div>
                    {form.isThaiOnly && (
                      <Chip variant='primary' size='sm'>
                        {t('thai_cuber_names_only')}
                      </Chip>
                    )}
                  </Card.Header>
                  
                  <Card.Content className='px-6 py-4 grow'>
                    <div className='flex flex-col gap-3 text-sm'>
                      <div>
                        <span className='text-default-500 text-xs font-semibold tracking-wider'>{t('open')}</span>
                        <p className='font-medium'>{openTime.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className='text-default-500 text-xs font-semibold tracking-wider'>{t('close')}</span>
                        <p className='font-medium'>{closeTime.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card.Content>

                  <Separator/>

                  <Card.Footer className='px-6 py-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <Link
                        href={`/predictions/${form.id}`}
                        className={`${buttonVariants({variant: 'primary'})} w-full font-semibold`}
                      >
                        {t(isActive ? 'play' : 'view')}
                      </Link>
                      <Link
                        href={`/predictions/${form.id}/leaderboard`}
                        className={`${buttonVariants({variant: 'primary'})} w-full font-semibold`}
                      >
                        {t('leaderboard')}
                      </Link>
                    </div>
                  </Card.Footer>
                </Card>
              ); 
            })}
          </div>
        )
      }
    </>
  );
}
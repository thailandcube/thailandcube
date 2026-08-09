'use client';

import { dateToRange } from '@/app/utils/DateTimeFormatter';
import { Competition } from '@/generated/prisma/client';
import { 
  Link,
  buttonVariants,
} from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';

export default function CompetitionDetails({ competition }: { competition : Competition }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className='w-full text-left flex flex-col gap-4'>
      <div>
        <h1 className='text-3xl md:text-5xl font-extrabold tracking-tight text-foreground'>
          {competition.name}
        </h1>
        <p className='text-lg md:text-xl text-default-500 font-medium mt-2'>
          {dateToRange(competition?.startDate, competition?.endDate)} <span className='text-default-400'>@</span> {competition.venue}
        </p>
      </div>

      <div className='flex flex-wrap items-center gap-4 mt-2'>
        {/* <Link href='#' className={buttonVariants({variant: 'primary'})}>
          {t('CompetitionInfo.register')}
        </Link> */}
        {/* <Link href='#schedule' className={buttonVariants({variant: 'primary'})}>
          {t('CompetitionInfo.schedule')}
        </Link> */}
        <Link href='#results' className={buttonVariants({variant: 'primary'})}>
          {t('CompetitionInfo.results')}
        </Link>
      </div>
    </div>
  );
}
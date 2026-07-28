'use client';

import { Competition } from '@/generated/prisma/client';
import { dateToRange } from '@/app/utils/DateTimeFormatter';
import { 
  Card,
  Separator,
  Button,
  buttonVariants,
  // Modal,
  // useOverlayState,
  // Table
} from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

// type ScheduleItem = {
//   date?: string;
//   time?: string;
//   event?: string;
//   format?: string;
//   time_limit?: string;
//   ranking?: string;
// };

export default function CompetitionInfoCard({competition, isWca=true}: {competition: Competition | null, isWca?: boolean}) {
  const t = useTranslations('CompetitionInfo');
  const locale = useLocale();

  const formatMarkdownHyperlink = (string: string) =>{
    const regex = /\[([^\]]+)\]\(([^)]+)\)/;

    const match = string.match(regex);

    if (match) {
      const text = match[1];
      const url = match[2];
      return {text, url};
    }
    else 
      return string;
  }

  if (competition) {
    const markdownData = formatMarkdownHyperlink(competition.venue);

    console.log(competition.name, competition.shortName)

    return (
      <>
        <Card className='w-full max-w-100 mx-auto mb-5'>
          <Card.Header className='flex flex-row items-center gap-3'>
            {
              isWca ? (
                <Image alt='WCA Logo' height={40} width={40} src='/assets/wca.svg'/>
              ) : ( 
                <Image alt='ThailandCube Logo' height={40} width={40} src='/assets/thailandcube.svg'/>
              )
            }
            <Card.Title>
              <p className='text-2xl font-bold'>{t(isWca ? 'wca' : 'non_wca')}</p>
            </Card.Title>
          </Card.Header>
          <Separator/>
          <Card.Content>
            <p className='text-xl font-bold'>{competition.name.length >= 32 && competition.shortName ? competition.shortName : competition.name}</p>
            <p className='text-small text-default-500'>@{ (typeof markdownData === 'string' ? markdownData : markdownData.text) ?? competition.venue }</p>
            <p>Date: {dateToRange(competition.startDate, competition.endDate)}</p>
          </Card.Content>
          <Separator/>
          <Card.Footer>
            {!isWca && (
              <Link
                href='https://docs.google.com/forms/d/e/1FAIpQLSfizf8EuVAvcKO86AamWJyAEmjXgHHIT08LOvTG3cr6zz3exA/viewform?usp=header'
                className={`${buttonVariants({ variant: 'primary' })} bg-success text-success-foreground`}
              >
                {t('register')}
              </Link>
            )}
            <Link className={`${buttonVariants({ variant: 'primary'})} ${!isWca ? 'mx-2' : ''}`} href={isWca ? `https://www.worldcubeassociation.org/competitions/${competition.competitionId}` : `/${competition.competitionId}`}>{t('details')}</Link>
          </Card.Footer>
        </Card>
      </>
    )
  }
}
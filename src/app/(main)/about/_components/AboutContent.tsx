'use client';

import {
  Card
} from '@heroui/react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import AboutOurMembers, { StaffMember } from './AboutOurMembers';

export default function AboutContent({ staffData }: { staffData: StaffMember[] }) {
  const t = useTranslations('About');
  const locale = useLocale();

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 md:px-10 py-8'>
        <h1 className='text-4xl font-bold'>{t('title')}</h1>
        <div className='flex flex-col gap-6 mt-6'>
          <Card>
            <Card.Header className='p-0 overflow-hidden'>
              <Image width={512} height={512} src='/assets/img/AboutCubing3Pics.png' alt='ThailandCube Banner' className='w-full object-cover rounded-b-none'/>
            </Card.Header>
            <Card.Content className='p-0 overflow-hidden'>
              <p className='text-3xl font-bold mb-3'>{t('speedcubing_heading')}</p>
              <p className='text-left md:text-justify leading-relaxed text-default-700'>&emsp;{t('speedcubing_content')}</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header className='p-0 overflow-hidden'>
              <Image width={512} height={512} src='/assets/img/ThailandCubeBanner.jpg' alt='ThailandCube Banner' className='w-full object-cover rounded-b-none'/>
            </Card.Header>
            <Card.Content className='p-0 overflow-hidden'>
              <p className='text-3xl font-bold mb-3'>{t('speedcubing_heading')}</p>
              <p className='text-left md:text-justify leading-relaxed text-default-700'>&emsp;{t('speedcubing_content')}</p>
            </Card.Content>
          </Card>
        </div>
        <div className='mt-10 mb-8 text-center sm:text-left'>
          <p className='text-4xl font-bold'>{locale === 'en' ? 'Our Core Team' : 'ทีมงานของเรา'}</p>
        </div>
        <AboutOurMembers locale={locale} staffData={staffData}/>
      </div>
    </>
  )
}
'use client';

import {
  Accordion,
  Link,
  Separator,
} from '@heroui/react';
import { FileText } from '@gravity-ui/icons';
import { useLocale, useTranslations } from 'next-intl';
import { YoutubeIcon } from '@/app/_components/BrandIcons';

const resourceLinkStyle =
  'inline-flex items-center gap-1.5 rounded-full border border-default-200 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary';

const answerTextStyle = 'text-default-500 leading-relaxed';

export default function FaqsPage() {
  const t = useTranslations('FAQs');
  const locale = useLocale();
  const isTh = locale === 'th';

  const categories = [
    {
      id: 'getting-started',
      label: isTh ? 'เริ่มต้น' : 'Getting started',
      items: ['how_to_register', 'find_comps'],
    },
    {
      id: 'at-the-competition',
      label: isTh ? 'ระหว่างการแข่งขัน' : 'At the competition',
      items: ['comp_process', 'before_compete', 'judge_roles'],
    },
    {
      id: 'after-the-competition',
      label: isTh ? 'หลังจบการแข่งขัน' : 'After the competition',
      items: ['receive_wca_id', 'local_comp'],
    },
  ];

  const renderAnswer = (key: string) => {
    switch (key) {
      case 'how_to_register':
        return isTh ? (
          <Link
            className={resourceLinkStyle}
            href={`assets/docs/how-to-register-wca-${locale}.pdf`}
          >
            <FileText className='h-4 w-4 shrink-0' />
            <span>{t('how_to_register_ans')}</span>
          </Link>
        ) : (
          <p className={answerTextStyle}>{t('how_to_register_ans')}</p>
        );

      case 'find_comps':
        return isTh ? (
          <p className={answerTextStyle}>
            ท่านสามารถค้นหางานแข่งในประเทศไทยได้จาก
            <Link href='/#activities' className='mx-1 text-primary underline'>
              กิจกรรม
            </Link>
            หรือ
            <Link
              href='https://www.worldcubeassociation.org/competitions?region=Thailand'
              className='mx-1 text-primary underline'
            >
              หน้าค้นหางานแข่งของ WCA
            </Link>
          </p>
        ) : (
          <p className={answerTextStyle}>
            You can find our upcoming competitions on the{' '}
            <Link href='/#activities' className='mx-1 text-primary underline'>
              Activities
            </Link>{' '}
            page, or via the{' '}
            <Link
              href='https://www.worldcubeassociation.org/competitions?region=Thailand'
              className='mx-1 text-primary underline'
            >
              WCA website
            </Link>
            .
          </p>
        );

      case 'comp_process':
        return (
          <div className='flex flex-col gap-4'>
            <p className={answerTextStyle}>{t('comp_process_ans')}</p>
            <Separator />
            <div className='flex flex-wrap gap-2'>
              <Link className={resourceLinkStyle} href={t('comp_process_ans_yt_url')}>
                <span className='h-4 w-4 shrink-0 text-red-600'>
                  <YoutubeIcon />
                </span>
                <span>{t('comp_process_ans_yt')}</span>
              </Link>
              <Link className={resourceLinkStyle} href={t('comp_process_ans_pdf_url')}>
                <FileText className='h-4 w-4 shrink-0' />
                <span>{t('comp_process_ans_pdf')}</span>
              </Link>
            </div>
          </div>
        );

      case 'before_compete':
        return <p className={answerTextStyle}>{t('before_compete_ans')}</p>;

      case 'judge_roles':
        return (
          <div className='flex flex-col gap-4'>
            <p className={answerTextStyle}>{t('judge_roles_ans')}</p>
            <Separator />
            <div className='flex flex-wrap gap-2'>
              <Link className={resourceLinkStyle} href={t('judge_roles_ans_yt_url')}>
                <span className='h-4 w-4 shrink-0 text-red-600'>
                  <YoutubeIcon />
                </span>
                <span>{t('judge_roles_ans_yt')}</span>
              </Link>
              <Link className={resourceLinkStyle} href={t('judge_roles_ans_pdf_url')}>
                <FileText className='h-4 w-4 shrink-0' />
                <span>{t('judge_roles_ans_pdf')}</span>
              </Link>
            </div>
          </div>
        );

      case 'receive_wca_id':
        return <p className={answerTextStyle}>{t('receive_wca_id_ans')}</p>;

      case 'local_comp':
        return <p className={answerTextStyle}>{t('local_comp_ans')}</p>;

      default:
        return null;
    }
  };

  return (
    <div className='mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16 lg:px-8'>
      <div className='mb-10 md:mb-14'>
        <span className='mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary'>
          FAQ
        </span>
        <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
          {t('title')}
        </h1>
      </div>

      <div className='flex flex-col gap-10 md:gap-12'>
        {categories.map((category, idx) => (
          <div key={category.id}>
            <h2 className='mb-3 text-sm font-semibold uppercase tracking-wide text-primary md:mb-4'>
              {category.label}
            </h2>

            <Accordion variant='surface' allowsMultipleExpanded className='w-full'>
              {category.items.map((key) => (
                <Accordion.Item id={key} key={key}>
                  <Accordion.Heading>
                    <Accordion.Trigger className='text-left text-base font-semibold md:text-lg'>
                      {t(key)}
                      <Accordion.Indicator />
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>{renderAnswer(key)}</Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>

            {idx < categories.length - 1 && <Separator className='mt-10 md:mt-12' />}
          </div>
        ))}
      </div>
    </div>
  );
}
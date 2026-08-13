'use client';

import { 
  Button, 
  buttonVariants, 
  Card, 
  Link, 
  Separator, 
  useOverlayState
} from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { EventCodeToFullMap } from '@/app/utils/EnumMapper';
import { NationalRecord } from '@/generated/prisma/client';
import { useState } from 'react';
import EditRecordModal from './EditRecordModal';

export default function StatisticsContent({ nationalRecords, isAdmin = false }: { nationalRecords: NationalRecord[] | null; isAdmin?: boolean }) {
  const [selectedRecord, setSelectedRecord] = useState<NationalRecord | null>(null);
  
  const t = useTranslations('Statistics');
  const locale = useLocale();

  const isEmptyNr = (record: NationalRecord) => {
    return !(record.competition && record.holder && record.result);
  };

  const getRecordMeta = (record: NationalRecord) => ({
    event: EventCodeToFullMap[record.event],
    recordType: t(record.type.toLowerCase()),
  });

  const records = (nationalRecords ?? []).filter((r) => !isEmptyNr(r));

  const editRecordModalState = useOverlayState();

  const handleEditRecordClick = (record: NationalRecord) => {
    setSelectedRecord(record);

    editRecordModalState.open();
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <h1 className='text-4xl font-bold tracking-tight'>{t('national_record')}</h1>
        {/* {
          isAdmin ?
          <Link href='#admin-edit' className={buttonVariants({variant: 'primary'})}>Edit Records</Link>
          : <></>
        } */}
      </div>

      {records.length === 0 ? (
        <p className='mt-10 text-default-500'>
          {locale === 'th'
            ? 'ยังไม่มีข้อมูลสถิติประเทศ ณ ขณะนี้'
            : 'No national records to show yet.'}
        </p>
      ) : (
        <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {records.map((record) => {
            const { event, recordType } = getRecordMeta(record);

            return (
              <Card key={record.id} className='h-full w-full'>
                <Card.Header>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-xs font-semibold uppercase tracking-wide text-primary'>
                      {event}
                    </span>
                    <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary'>
                      {recordType}
                    </span>
                  </div>
                  <Card.Title className='text-3xl font-bold tabular-nums'>
                    {record.result}
                  </Card.Title>
                </Card.Header>

                <Separator />

                <Card.Content className='gap-3'>
                  <div>
                    <p className='text-lg font-semibold text-foreground'>{record.holder}</p>
                    <p className='text-sm text-default-500'>@{record.competition}</p>
                  </div>

                  <div className='flex justify-center rounded-lg bg-default-100 py-4 dark:bg-default-50'>
                    <Image
                      src={
                        record.mimeType && record.imageData
                          ? `data:${record.mimeType};base64,${record.imageData}`
                          : '/assets/img/nr-fallback.png'
                      }
                      alt={record.caption ?? `${record.holder} — ${event}`}
                      width={300}
                      height={300}
                      sizes='(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw'
                      className='h-auto w-full max-w-65 rounded-md object-cover'
                    />
                  </div>

                  {record.caption && (
                    <p className='border-l-2 border-default-200 pl-3 text-sm italic text-default-500'>
                      “{record.caption}”
                    </p>
                  )}
                </Card.Content>
                {
                  isAdmin ?
                  <Card.Footer>
                    <Button variant='primary' onPress={() => handleEditRecordClick(record)}>Edit Record</Button>
                  </Card.Footer>
                  : <></>
                }
              </Card>
            );
          })}
        </div>
      )}
      {selectedRecord && <EditRecordModal state={editRecordModalState} recordData={selectedRecord}/>}
    </div>
  );
}
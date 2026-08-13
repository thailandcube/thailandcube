'use client';

import { Label, ListBox, Select, Tabs, Spinner, Link } from '@heroui/react';
import type { Key } from '@heroui/react';
import { EventCodeToFullMap } from '@/app/utils/EnumMapper';
import { Competition, Event, Round, Registration } from '@/generated/prisma/client';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import ResultTable from './ResultTable';

interface ExtendedEvent extends Event {
  rounds: Round[];
}

interface ExtendedCompetition extends Competition {
  events: ExtendedEvent[];
  registrations: Registration[];
}

export default function CompetitionInfoResults({ competition }: { competition: ExtendedCompetition }) {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);

  const locale = useLocale();
  const t = useTranslations('CompetitionInfo');
  const tGlobal = useTranslations('Global');
  const tResultTable = useTranslations('ResultTable');

  const getTitleString = (event: Event) => {
    const eventString = EventCodeToFullMap[event.event];
    const ageString = locale === 'en' ? `Age ${event.maxAge} and Under` : `รุ่นอายุไม่เกิน ${event.maxAge} ปี`;

    if (!(eventString && ageString))
      return '';
    else if (event.maxAge)
      return `${eventString} (${ageString})`;
    else
      return eventString;
  }

  const selectedEvent = competition.events.find((e) => e.id === selectedKey);
  const sortedRounds = selectedEvent?.rounds.sort((a, b) => a.round - b.round) ?? [];

  return (
    <div id='results' className='flex flex-col gap-6 w-full'>
      <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>{t('results')}</h2>
      
      <div className='w-full sm:max-w-xs'>
        <Select
          placeholder={tGlobal('select_event')}
          value={selectedKey}
          onChange={(value) => setSelectedKey(value)}
          aria-label='Select an event'
        >
          <Label>{tGlobal('event')}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {
                competition.events.map((e) => (
                  <ListBox.Item key={e.id} id={e.id}>
                    <Label>{getTitleString(e)}</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))
              }
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className='w-full'>
        {
          sortedRounds.length ? (
            <Tabs variant='secondary'>
              <Tabs.ListContainer className='overflow-x-auto w-full'>
                <Tabs.List aria-label='Event Tabs'>
                  {
                    selectedEvent?.rounds.map((r) => (
                      <Tabs.Tab key={r.round} id={r.round}>
                        {tResultTable('round')} {r.round}
                        <Tabs.Separator /> 
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    ))
                  }
                </Tabs.List>
              </Tabs.ListContainer>
              
              {
                sortedRounds.map((r) => (
                  <Tabs.Panel key={r.round} id={r.round} className='pt-4'>
                    {
                      !r.tournamentUrl ? (
                        <ResultTable competitionId={competition.competitionId} event={selectedEvent!} round={r}/>
                      ) : (
                        <div className='flex justify-center items-center py-12 px-4 border-2 border-dashed border-default-200 rounded-xl'>
                          <Link href={r.tournamentUrl} target='_blank' rel='noopener noreferrer' className='text-lg md:text-xl font-medium text-center underline'>
                            {t('click_to_view_tournament')}
                          </Link>
                        </div>
                      )
                    }
                  </Tabs.Panel>
                ))
              }
            </Tabs>
          ) : (
            <div className='flex items-center justify-center py-16 px-4 bg-default-50 rounded-xl border border-default-100'>
              <h3 className='text-center text-xl md:text-2xl font-medium text-default-500'>
                {t('select_event_to_view_results')}
              </h3> 
            </div>
          )
        }
      </div>
    </div>
  );
}
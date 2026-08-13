'use client';

import { Competition } from '@/generated/prisma/client';
import type { Key } from '@heroui/react';
import {
  ComboBox,
  Input,
  Label,
  ListBox,
  Tabs
} from '@heroui/react';
import { useState } from 'react';
import CompetitorsTab from './CompetitorsTab';

export default function CompetitionManager({ data }: { data: Competition[]}) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<Key | null>(null);

  const selectedCompetition = data.find((comp) => comp.competitionId === selectedCompetitionId);

  return (
    <>
      <div className='mx-auto'>
        <ComboBox
          value={selectedCompetitionId}
          onChange={(val) => {
            if (val)
              setSelectedCompetitionId(val);
          }}
        >
          <Label>Search Competitions</Label>
          <ComboBox.InputGroup>
            <Input placeholder='Search competitions...'/>
            <ComboBox.Trigger/>
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              {
                data.map((comp) => (
                  <ListBox.Item key={comp.competitionId} id={comp.competitionId} textValue={comp.shortName ?? comp.name}>
                    {comp.shortName ?? comp.name}
                  </ListBox.Item>
                ))
              }
            </ListBox>
          </ComboBox.Popover>
        </ComboBox>
        {
          selectedCompetition && 
          <Tabs className='mt-8'>
            <Tabs.ListContainer className='mb-8'>
              <Tabs.List aria-label='Options'>
                <Tabs.Tab id='competitors'>
                  Competitors
                  <Tabs.Separator/>
                  <Tabs.Indicator/>
                </Tabs.Tab>
                <Tabs.Tab id='events-rounds'>
                  Events & Rounds
                  <Tabs.Separator/>
                  <Tabs.Indicator/>
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id='competitors'>
              {selectedCompetitionId && <CompetitorsTab competition={selectedCompetition} competitionId={selectedCompetitionId.toString()}/>}
            </Tabs.Panel>
            <Tabs.Panel id='events-rounds'>
              <p>Events & Rounds</p>
            </Tabs.Panel>
          </Tabs>
        }
      </div>
    </>
  );
}
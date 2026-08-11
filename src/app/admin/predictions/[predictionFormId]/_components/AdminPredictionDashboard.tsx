'use client';

import {
  Card,
  Tabs,
  Chip,
  Button,
  Separator,
  Table,
  Modal,
  useOverlayState,
  Autocomplete,
  Label,
  ListBox,
  SearchField,
  useFilter,
  toast,
} from '@heroui/react';
import React, { useState, useMemo } from 'react';
import type { PredictionForm, PredictionSubmission, PredictionRecord, PredictionEventCompetitor, User, Competitor, PredictionAnswer, EventType, Placement } from '@/generated/prisma';
import { extractLatinName } from '@/app/utils/ExtractLatinName';
import { AdminPredictionFormDTO } from '@/app/lib/dtos/AdminPredictionFormDTO';
import { useRouter } from 'next/navigation';
import { EventCodeToFullMap } from '@/app/utils/EnumMapper';
import { updatePredictionAnswers } from '@/app/actions/predictions';

type UserWithCompetitor = User & {
  competitor: Competitor | null;
};

type RecordWithCuber = PredictionRecord & {
  predictedCuber: PredictionEventCompetitor;
};

type SubmissionWithPredictions = PredictionSubmission & {
  user: UserWithCompetitor | null;
  predictions: RecordWithCuber[];
};

const PlacementMap = {
  'CHAMPION': 'Champion (1st)',
  'FIRST_RUNNER_UP': 'Runner Up (2nd)',
  'SECOND_RUNNER_UP': 'Second Runner Up (3rd)'
};

const PlacementsList = ['CHAMPION', 'FIRST_RUNNER_UP', 'SECOND_RUNNER_UP'];

export default function AdminPredictionDashboard({ form }: { form: AdminPredictionFormDTO }) {
  const router = useRouter();

  const {contains} = useFilter({sensitivity: 'base'});

  const state = useOverlayState();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithPredictions | null>(null);

  const [isGrading, setIsGrading] = useState(false);
  const [isSavingAnswers, setIsSavingAnswers] = useState(false);
  const [isTogglingLock, setIsTogglingLock] = useState(false);

  const initialAnswers: Record<string, Record<string, string>> = {};

  if (form.answers) {
    for (const ans of form.answers) {
      if (!initialAnswers[ans.event]) 
        initialAnswers[ans.event] = {};
      initialAnswers[ans.event][ans.placement] = ans.actualCuberId.toString();
    }
  }

  const [answersState, setAnswersState] = useState<Record<string, Record<string, string>>>(initialAnswers);

  const uniqueEvents = useMemo(() => {
    const events = new Set<string>();
    const cuberList = form.cubers || []; 
    for (const cuber of cuberList) 
      events.add(cuber.event);
    return Array.from(events);
  }, [form.cubers]);

  const getStatus = () => {
    const now = new Date();
    const open = new Date(form.openTime);
    const close = new Date(form.closeTime);

    if (form.isLocked) return { label: 'Locked', color: 'danger' as const };
    if (now < open) return { label: 'Upcoming', color: 'warning' as const };
    if (now >= open && now <= close) return { label: 'Active', color: 'success' as const };
    return { label: 'Closed', color: 'danger' as const };
  };

  const status = getStatus();

  const isPastDeadline = new Date() > new Date(form.closeTime) || form.isLocked;

  const handleViewPredictions = (submission: SubmissionWithPredictions) => {
    setSelectedSubmission(submission);
    state.open();
  };

  const handleAnswerChange = (eventCode: string, placement: string, cuberId: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [eventCode]: {
        ...prev[eventCode],
        [placement]: cuberId
      }
    }));
  };

  const handleSaveAnswers = async () => {
    setIsSavingAnswers(true);
    
    try {
      const payload = [];
      
      for (const eventCode of Object.keys(answersState)) {
        for (const placement of Object.keys(answersState[eventCode])) {
          const cuberId = answersState[eventCode][placement];
          if (cuberId) {
            payload.push({
              predictionFormId: form.id,
              event: eventCode as EventType,
              placement: placement as Placement,
              actualCuberId: parseInt(cuberId, 10)
            });
          }
        }
      }

      const response = await updatePredictionAnswers(form.id, payload);

      if (!response.success) 
        throw new Error('Failed to save answers');

      toast.success('Official answers saved successfully!');
      router.refresh();
    } 
    catch (error) {
      console.error(error);
      toast.danger('An error occurred while saving answers.');
    } 
    finally {
      setIsSavingAnswers(false);
    }
  };

  const handleGradePredictions = async () => {
    const confirmed = window.confirm('Are you sure you want to grade all predictions? Make sure you have saved the Official Answers first.');
    if (!confirmed) return;

    setIsGrading(true);

    try {
      const res = await fetch(`/api/predictions/${form.id}/grade`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Grading failed');

      alert('Predictions graded successfully!');
      router.refresh(); 
    } 
    catch (error) {
      console.error(error);
      alert('An error occurred while grading predictions.');
    } 
    finally {
      setIsGrading(false);
    }
  };

  const handleToggleLock = async () => {
    const newLockState = !form.isLocked;
    const actionText = newLockState ? 'lock' : 'unlock';
    
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this form?`);
    if (!confirmed) return;

    setIsTogglingLock(true);

    try {
      const res = await fetch(`/api/predictions/${form.id}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: newLockState })
      });

      if (!res.ok) throw new Error(`Failed to ${actionText} submissions`);

      alert(`Submissions have been manually ${newLockState ? 'closed' : 'opened'}.`);
      router.refresh(); 
    } 
    catch (error) {
      console.error(error);
      alert(`An error occurred while trying to ${actionText} submissions.`);
    } 
    finally {
      setIsTogglingLock(false);
    }
  };

  const groupedModalPredictions = useMemo(() => {
    if (!selectedSubmission) return {};
    
    const grouped: Record<string, RecordWithCuber[]> = {};
    for (const record of selectedSubmission.predictions) {
      if (!grouped[record.event]) 
        grouped[record.event] = [];
      grouped[record.event].push(record);
    }
    return grouped;
  }, [selectedSubmission]);

  const getPredictorName = (sub: SubmissionWithPredictions) => {
    const rawName = sub.user?.competitor?.name;
    return rawName ? extractLatinName(rawName) : `Player (User ${sub.userId})`;
  };

  const getPredictionStatusStyles = (status: string) => {
    switch (status) {
      case 'CORRECT': return 'border-success-200 bg-success-50 text-success-800';
      case 'PODIUM': return 'border-warning-200 bg-warning-50 text-warning-800';
      case 'INCORRECT': return 'border-danger-200 bg-danger-50 text-danger-800';
      default: return 'border-default-100 bg-default-50 text-default-800';
    }
  };

  return (
    <>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold flex items-center gap-3'>
              {form.name}
              <Chip color={status.color} variant='soft' size='sm'>{status.label}</Chip>
            </h1>
            <p className='text-default-500 mt-1'>
              Competition ID: <span className='font-mono text-foreground'>{form.id}</span>
            </p>
          </div>

          <div className='flex gap-2'>
            <Button 
              variant='primary' 
              isPending={isGrading} 
              onPress={() => handleGradePredictions()}
            >
              Grade Predictions
            </Button>
            <Button 
              className={`${form.isLocked ? 'bg-success' : 'bg-danger'} text-white`}
              isPending={isTogglingLock}
              onPress={() => handleToggleLock()}
            >
              {form.isLocked ? 'Open Submissions' : 'Close Submissions'}
            </Button>
          </div>
        </div>
        <Tabs variant='secondary'>
          <Tabs.ListContainer>
            <Tabs.List aria-label='Dashboard Options'>
              <Tabs.Tab id='overview'>
                Overview
                <Tabs.Indicator/>
              </Tabs.Tab>
              <Tabs.Tab id='submissions'>
                Submissions
                <Tabs.Indicator/>
              </Tabs.Tab>
              <Tabs.Tab id='answers'>
                Official Answers
                <Tabs.Indicator/>
              </Tabs.Tab>
              <Tabs.Tab id='roster'>
                Event Roster
                <Tabs.Indicator/>
              </Tabs.Tab>
              <Tabs.Tab id='settings'>
                Settings
                <Tabs.Indicator/>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id='overview'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
              <Card>
                <Card.Content className='py-8 text-center'>
                  <p className='text-default-500 text-sm font-medium'>Total Submissions</p>
                  <p className='text-4xl font-bold mt-2'>{form._count.submissions}</p>
                </Card.Content>
              </Card>
              
              <Card>
                <Card.Content className='py-8 text-center'>
                  <p className='text-default-500 text-sm font-medium'>Competitors Loaded</p>
                  <p className='text-4xl font-bold mt-2'>{form._count.cubers}</p>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content className='py-8 text-center flex flex-col justify-center gap-2'>
                  <div>
                    <span className='text-default-500 text-xs'>OPENS</span>
                    <p className='font-medium text-sm'>
                      {new Date(form.openTime).toLocaleString()}
                    </p>
                  </div>
                  <Separator/>
                  <div>
                    <span className='text-default-500 text-xs'>CLOSES</span>
                    <p className='font-medium text-sm'>
                      {new Date(form.closeTime).toLocaleString()}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </Tabs.Panel>
          <Tabs.Panel id='submissions'>
            <Card className='mt-4'>
              <Card.Content className='px-0 py-0'>
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label='Submissions admin table'>
                      <Table.Header>
                        <Table.Column isRowHeader>RANK</Table.Column>
                        <Table.Column>PLAYER</Table.Column>
                        <Table.Column>WCA ID</Table.Column>
                        <Table.Column>SCORE</Table.Column>
                        <Table.Column>SUBMITTED AT</Table.Column>
                        <Table.Column>ACTIONS</Table.Column>
                      </Table.Header>
                      <Table.Body renderEmptyState={() => <p className='text-center text-2xl font-semibold'>No submissions yet.</p>}>
                        {form.submissions.map((sub, index) => (
                          <Table.Row key={sub.id}>
                            <Table.Cell>
                              <span className='font-bold text-default-600'>#{index + 1}</span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className='font-medium'>
                                {getPredictorName(sub)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              {sub.wcaId ? (
                                <Chip size='sm' variant='soft'>{sub.wcaId}</Chip>
                              ) : (
                                <span className='text-default-400'>-</span>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              <Chip color={sub.score > 0 ? 'success' : 'default'} variant='soft'>
                                {sub.score} pts
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>
                              <span className='text-sm text-default-500'>
                                {new Date(sub.createdAt).toLocaleString()}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <Button 
                                size='sm' 
                                variant='primary' 
                                onPress={() => handleViewPredictions(sub)}
                              >
                                View Picks
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              </Card.Content>
            </Card>
          </Tabs.Panel>
          <Tabs.Panel id='answers'>
            <Card className='mt-4'>
              <Card.Content className='flex flex-col gap-6 py-6 px-6 md:px-8'>
                <div>
                  <h2 className='text-xl font-bold'>Set Official Podiums</h2>
                  <p className='text-default-500 text-sm mt-1'>
                    Select the actual winners here before clicking the Grade Predictions button.
                  </p>
                </div>

                {!isPastDeadline && (
                  <div className='bg-warning-50 p-4 rounded-lg border border-warning-200'>
                    <p className='text-sm text-warning-800 font-medium'>
                      ⚠️ You can only set the official answers after the prediction deadline has passed or the form is manually locked.
                    </p>
                  </div>
                )}

                <Separator/>

                  {uniqueEvents.map((eventCode) => {
                    const eventName = EventCodeToFullMap[eventCode as keyof typeof EventCodeToFullMap] || eventCode;
                    const cubersForEvent = form.cubers.filter(c => c.event === eventCode);

                    return (
                      <div key={eventCode} className='flex flex-col gap-4 bg-default-50 p-5 rounded-lg border border-default-100'>
                        <h3 className='font-semibold text-lg text-default-800'>{eventName}</h3>
                        
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          {PlacementsList.map((placement) => (
                            <Autocomplete 
                              key={`${eventCode}-${placement}`}
                              isDisabled={!isPastDeadline}
                              selectedKey={answersState[eventCode]?.[placement] || null}
                              onSelectionChange={(key) => handleAnswerChange(eventCode, placement, key as string)}
                            >
                              <Label>{PlacementMap[placement as keyof typeof PlacementMap]}</Label>
                              <Autocomplete.Trigger>
                                <Autocomplete.Value/>
                                <Autocomplete.ClearButton/>
                                <Autocomplete.Indicator/>
                              </Autocomplete.Trigger>
                              <Autocomplete.Popover>
                                <Autocomplete.Filter filter={contains}>
                                  <SearchField autoFocus name="search" variant="secondary">
                                    <SearchField.Group>
                                      <SearchField.SearchIcon />
                                      <SearchField.Input placeholder="Search..." />
                                      <SearchField.ClearButton />
                                    </SearchField.Group>
                                  </SearchField>
                                  <ListBox>
                                    {cubersForEvent.map(cuber => (
                                      <ListBox.Item key={cuber.id.toString()} id={cuber.id} textValue={cuber.name}>
                                        <div className='flex justify-between items-center w-full'>
                                          <span>{extractLatinName(cuber.name)}</span>
                                          {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                                        </div>
                                      </ListBox.Item>
                                    ))}
                                  </ListBox>
                                </Autocomplete.Filter>
                              </Autocomplete.Popover>
                            </Autocomplete>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                <div className='flex justify-end mt-4'>
                  <Button 
                    variant='primary' 
                    className='w-full md:w-auto font-semibold'
                    size='lg'
                    isDisabled={!isPastDeadline}
                    isPending={isSavingAnswers}
                    onPress={handleSaveAnswers}
                  >
                    Save Official Answers
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </div>

      <Modal 
        state={state}
      >
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger/>
              <Modal.Header className='flex flex-col gap-1'>
                <span className='text-lg font-bold'>
                  {selectedSubmission ? `${getPredictorName(selectedSubmission)}'s Picks` : 'Player Predictions'}
                </span>
                <span className='text-xs font-normal text-default-400'>
                  Form: {form.name} | Total Score: {selectedSubmission?.score} pts
                </span>
              </Modal.Header>
              <Modal.Body className='py-4'>
                <div className='flex flex-col gap-6'>
                  {Object.entries(groupedModalPredictions).map(([eventCode, records]) => {
                    const eventName = EventCodeToFullMap[eventCode as keyof typeof EventCodeToFullMap] || eventCode;
                    
                    const sortedRecords = [...records].sort((a, b) => {
                      const order = ['CHAMPION', 'FIRST_RUNNER_UP', 'SECOND_RUNNER_UP'];
                      return order.indexOf(a.placement) - order.indexOf(b.placement);
                    });

                    return (
                      <div key={eventCode} className='flex flex-col gap-2'>
                        <h3 className='text-sm font-bold text-default-700 border-b pb-1'>
                          {eventName}
                        </h3>
                        <div className='flex flex-col gap-1.5'>
                          {sortedRecords.map((record) => (
                            <div 
                              key={record.id} 
                              className={`flex justify-between items-center px-3 py-2 rounded-md border text-sm ${getPredictionStatusStyles(record.status)}`}
                            >
                              <div>
                                <span className='text-xs font-semibold opacity-70 block'>
                                  {PlacementMap[record.placement]}
                                </span>
                                <span className='font-medium'>
                                  {extractLatinName(record.predictedCuber.name)}
                                </span>
                              </div>
                              {record.predictedCuber.wcaId && (
                                <Chip size='sm' variant='soft' className='font-mono bg-white/50 dark:bg-black/20'>
                                  {record.predictedCuber.wcaId}
                                </Chip>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant='danger' onPress={() => state.close()}>
                    Close
                  </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
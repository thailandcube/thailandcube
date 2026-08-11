'use client';

import { submitPrediction } from '@/app/actions/predictions';
import { EventCodeToFullMap } from '@/app/utils/EnumMapper';
import type { PredictionEventCompetitor, PredictionForm, PredictionRecord, PredictionSubmission } from '@/generated/prisma/client';
import { Autocomplete, Button, Card, Checkbox, Chip, EmptyState, ErrorMessage, Form, Input, Label, ListBox, Modal, SearchField, Separator, toast, useFilter } from '@heroui/react';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

type SubmissionWithRecords = PredictionSubmission & {
  predictions: PredictionRecord[];
};

interface Props { 
  form: PredictionForm;
  roster: PredictionEventCompetitor[];
  existingSubmission?: SubmissionWithRecords | null;
}

export default function PredictionForm({ form, roster, existingSubmission }: Props) {
  const { data: session, status } = useSession();

  const isSubmitted = !!existingSubmission;

  const [name, setName] = useState('');
  const [wcaId, setWcaId] = useState('');
  const [wantPrize, setWantPrize] = useState(existingSubmission ? existingSubmission.wantsPrize : false);
  const [termsAccepted, setTermsAccepted] = useState(isSubmitted);
  const [isLoading, setIsLoading] = useState(false);

  const initialPredictions: Record<string, number> = {};

  if (existingSubmission) {
    existingSubmission.predictions.forEach(p => {
      initialPredictions[`${p.event}_${p.placement}`] = p.predictedCuberId;
    });
  }

  const [predictions, setPredictions] = useState<Record<string, number>>(initialPredictions);

  const {contains} = useFilter({sensitivity: 'base'});

  const now = new Date();
  const openTime = new Date(form.openTime);
  const closeTime = new Date(form.closeTime);

  const isUpcoming = now < openTime && !form.isLocked;
  const isClosed = now > closeTime || form.isLocked;
  
  const isReadOnly = isClosed && isSubmitted;

  const uniqueEvents = useMemo(() => {
    return Array.from(new Set(roster.map((c) => c.event)));
  }, [roster]);

  const getCubersForEvent = (eventCode: string) => {
    return roster
      .filter((c) => c.event === eventCode)
      .sort((a, b) => a.pos - b.pos);
  };

  const handleSelectionChange = (key: string, competitorId: React.Key | null) => {
    setPredictions((prev) => {
      const newPredictions = { ...prev };

      if (competitorId)
        newPredictions[key] = Number(competitorId);
      else
        delete newPredictions[key]; 
      
      return newPredictions;
    });
  };

  const checkIsDuplicate = (key: string, eventCode: string) => {
    const val = predictions[key];
    
    if (!val) 
      return false;

    const allValsInEvent = [
      predictions[`${eventCode}_CHAMPION`],
      predictions[`${eventCode}_FIRST_RUNNER_UP`],
      predictions[`${eventCode}_SECOND_RUNNER_UP`]
    ];

    return allValsInEvent.filter((v) => v === val).length > 1;
  };

  const hasAnyDuplicates = useMemo(() => {
    for (const eventCode of uniqueEvents) {
      const selectedIds = [
        predictions[`${eventCode}_CHAMPION`],
        predictions[`${eventCode}_FIRST_RUNNER_UP`],
        predictions[`${eventCode}_SECOND_RUNNER_UP`]
      ].filter(Boolean); 

      if (new Set(selectedIds).size !== selectedIds.length) 
        return true;
    }
    
    return false;
  }, [predictions, uniqueEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasAnyDuplicates){
      alert('Please fix the duplicate selections before submitting.');
      return;
    }

    if (!termsAccepted) {
      alert('You must accept the terms to submit.');
      return;
    }

    if (!session?.user?.id) {
      alert('You must be logged in to submit.');
      return;
    }

    setIsLoading(true);

    try {
      const predictionsPayload = [];

      for (const eventCode of uniqueEvents) {
        const championId = predictions[`${eventCode}_CHAMPION`];
        const firstRunnerUpId = predictions[`${eventCode}_FIRST_RUNNER_UP`];
        const secondRunnerUpId = predictions[`${eventCode}_SECOND_RUNNER_UP`];

        if (championId || firstRunnerUpId || secondRunnerUpId) {
          predictionsPayload.push({
            event: eventCode,
            championId: championId ?? null,
            firstRunnerUpId: firstRunnerUpId ?? null,
            secondRunnerUpId: secondRunnerUpId ?? null,
          });
        }
      }

      const payload = {
        predictionFormId: form.id,
        userId: Number.parseInt(session.user.id, 10),
        wcaId: wcaId || null,
        wantPrize: wantPrize,
        predictions: predictionsPayload
      };

      // console.log('Submitting Payload:', payload);

      const response = await submitPrediction(payload);
      
      if (!response.success) {
        toast.danger('Submission failed');
        throw new Error('Submission failed');
      }
      
      toast.success(isSubmitted ? 'Prediction updated successfully!' : 'Prediction submitted successfully!');
      window.location.reload(); 
    } 
    catch (error) {
      console.error(error);
    } 
    finally {
      setIsLoading(false);
    }
  };

  const loginModal = (
    <Modal>
      <Modal.Backdrop isOpen={status === 'unauthenticated'}>
        <Modal.Container>
          <Modal.Dialog aria-label='Login'>
            <Modal.Header className='flex flex-col gap-1'>Authentication Required</Modal.Header>
            <Modal.Body>
              <p>You must be logged in to participate in the prediction game.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='primary' onPress={() => signIn('wca')}>
                Log In with WCA
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) 
        return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_WCA_URL}/api/v0/users/${session.user.id}`);
        const data = await response.json();
        
        setWcaId(data.user.wca_id ?? null);
        setName(data.user.name ?? null);
      } 
      catch (error) {
        console.error('Failed to fetch WCA user data:', error);
      }
    };

    fetchUserData();
  }, [session]);

  if (isUpcoming) {
    return (
      <>
        {loginModal}
        <Card className='text-center py-12'>
          <Card.Content>
            <h2 className='text-2xl font-bold'>Hold your horses! 🐎</h2>
            <p className='text-center text-default-500 mt-2'>
              Submissions for {form.name} open on {openTime.toLocaleString()}.
            </p>
          </Card.Content>
        </Card>
      </>
    );
  }

  if (isClosed && !isSubmitted) {
    return (
      <>
        {loginModal}
        <Card className='text-center py-12'>
          <Card.Content>
            <h2 className='text-2xl font-bold'>Submissions Closed 🔒</h2>
            <p className='text-center text-default-500 mt-2'>
              {form.isLocked 
                ? `Submissions for ${form.name} have been locked by an admin.` 
                : `We are no longer accepting predictions for ${form.name}.`}
            </p>
          </Card.Content>
        </Card>
      </>
    );
  }
  
  return (
    <>
      {loginModal}
      <Card>
        <Card.Header className='flex flex-col items-start px-6 pt-6 pb-4'>
          <div className='flex justify-between w-full items-center'>
            <h1 className='text-2xl font-bold'>{form.name}</h1>
            <Chip color={isClosed ? 'danger' : 'success'} variant='soft'>
              {isClosed ? 'Closed' : 'Open'}
            </Chip>
          </div>
          <p className='text-default-500 text-sm mt-1'>
            Closes on {closeTime.toLocaleString()}
          </p>
          {form.isThaiOnly && (
            <Chip color='accent' variant='soft' size='sm' className='mt-2'>
              Thai Nationals Edition (TH Cubers Only)
            </Chip>
          )}
        </Card.Header>
        <Separator/>
        <Card.Content className='px-6 py-6'>
          {
            isReadOnly ? 
            (
              <div className='bg-success-50 p-5 rounded-lg mb-8 flex flex-col gap-2 border border-success-200'>
                <h2 className='text-lg font-bold text-success-800'>✅ Predictions Locked In</h2>
                <p className='text-sm text-success-700'>
                  Submissions are now closed. Your choices are locked in and displayed below for your reference. Best of luck!
                </p>
              </div>
            ) : isSubmitted ? (
              <div className='bg-warning-50 p-5 rounded-lg mb-8 flex flex-col gap-2 border border-warning-200'>
                <h2 className='text-lg font-bold text-warning-800'>✏️ Update Your Predictions</h2>
                <p className='text-sm text-warning-700'>
                  You have already submitted, but the form is still open. You may update your predictions until the deadline.
                </p>
              </div>
            ) : null
          }

          <div className='bg-default-100 p-5 rounded-lg mb-8 flex flex-col gap-3'>
            <h2 className='text-lg font-bold text-default-800'>📜 Prediction Rules</h2>
            <ul className='list-disc list-inside text-sm text-default-600 flex flex-col gap-2'>
              <li><strong>One Entry:</strong> You may only submit your predictions once per competition.</li>
              <li><strong>Editing:</strong> You may edit your predictions as many times as you like before the deadline.</li>
              <li><strong>Finality:</strong> Once the deadline passes or the form is locked, predictions cannot be edited.</li>
              <li><strong>Scoring:</strong> Points are awarded for correctly predicting the exact placement of competitors.</li>
              <li><strong>Duplicates:</strong> You cannot select the same competitor for multiple placements within a single event.</li>
              <li><strong>Prizes:</strong> To be eligible for prizes (if applicable), you must check the prize consent box below.</li>
            </ul>
          </div>

          <Form onSubmit={handleSubmit} className='flex flex-col gap-8'>
            <div className='flex flex-col gap-4'>
              <h2 className='text-lg font-semibold'>Your Information</h2>
              <Label>Predictor Name</Label>
              <Input 
                required
                type='text' 
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled
              />
              <Label>WCA ID</Label>
              <Input 
                type='text' 
                value={wcaId}
                onChange={(event) => setWcaId(event.target.value)}
                placeholder='e.g. 2024KASE01'
                disabled
              />
              <Checkbox 
                isSelected={wantPrize} 
                onChange={setWantPrize}
                isDisabled={isReadOnly}
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator/>
                  </Checkbox.Control>
                  I wish to receive a prize if I am eligible.
                </Checkbox.Content>
              </Checkbox>
            </div>

            <Separator/>

            {uniqueEvents.map((eventCode) => {
              const eventCubers = getCubersForEvent(eventCode);
              const eventName = EventCodeToFullMap[eventCode] || eventCode;

              const champKey = `${eventCode}_CHAMPION`;
              const firstRunnerKey = `${eventCode}_FIRST_RUNNER_UP`;
              const secondRunnerKey = `${eventCode}_SECOND_RUNNER_UP`;

              const isChampInvalid = checkIsDuplicate(champKey, eventCode);
              const isFirstRunnerInvalid = checkIsDuplicate(firstRunnerKey, eventCode);
              const isSecondRunnerInvalid = checkIsDuplicate(secondRunnerKey, eventCode);

              return (
                <div key={eventCode} className='flex flex-col gap-4'>
                  <h2 className='text-lg font-semibold'>{eventName} Predictions</h2>
                    
                  <Autocomplete
                    isRequired
                    value={predictions[champKey]?.toString() || null}
                    onChange={(id) => handleSelectionChange(champKey, id)}
                    isInvalid={isChampInvalid}
                    isDisabled={isReadOnly}
                  >
                    <Label>Champion (1st Place)</Label>
                    <Autocomplete.Trigger>
                      <Autocomplete.Value/>
                      <Autocomplete.ClearButton/>
                      <Autocomplete.Indicator/>
                    </Autocomplete.Trigger>
                    <Autocomplete.Popover>
                      <Autocomplete.Filter filter={contains}>
                        <SearchField autoFocus name='search' variant='secondary'>
                          <SearchField.Group>
                            <SearchField.SearchIcon />
                            <SearchField.Input placeholder='Search...' />
                            <SearchField.ClearButton />
                          </SearchField.Group>
                        </SearchField>
                        <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                          {eventCubers.map((cuber, index) => (
                            <ListBox.Item key={cuber.id.toString()} id={cuber.id.toString()} textValue={cuber.name}>
                              <div className='flex justify-between items-center w-full'>
                                <span>{index+1} - {cuber.name.split('(')[0].trim()}</span>
                                {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                              </div>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Autocomplete.Filter>
                    </Autocomplete.Popover>
                    <ErrorMessage>{!!isChampInvalid && <>Competitor already selected in this event</>}</ErrorMessage>
                  </Autocomplete>
                  <Autocomplete
                    isRequired
                    value={predictions[firstRunnerKey]?.toString() || null}
                    onChange={(id) => handleSelectionChange(firstRunnerKey, id)}
                    isInvalid={isFirstRunnerInvalid}
                    isDisabled={isReadOnly}
                  >
                    <Label>Runner Up (2nd Place)</Label>
                    <Autocomplete.Trigger>
                      <Autocomplete.Value/>
                      <Autocomplete.ClearButton/>
                      <Autocomplete.Indicator/>
                    </Autocomplete.Trigger>
                    <Autocomplete.Popover>
                      <Autocomplete.Filter filter={contains}>
                        <SearchField autoFocus name='search' variant='secondary'>
                          <SearchField.Group>
                            <SearchField.SearchIcon />
                            <SearchField.Input placeholder='Search...' />
                            <SearchField.ClearButton />
                          </SearchField.Group>
                        </SearchField>
                        <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                          {eventCubers.map((cuber, index) => (
                            <ListBox.Item key={cuber.id.toString()} id={cuber.id.toString()} textValue={cuber.name}>
                              <div className='flex justify-between items-center w-full'>
                                <span>{index+1} - {cuber.name.split('(')[0].trim()}</span>
                                {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                              </div>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Autocomplete.Filter>
                    </Autocomplete.Popover>
                    <ErrorMessage>{!!isFirstRunnerInvalid && <>Competitor already selected in this event</>}</ErrorMessage>
                  </Autocomplete>
                  <Autocomplete
                    isRequired
                    value={predictions[secondRunnerKey]?.toString() || null}
                    onChange={(id) => handleSelectionChange(secondRunnerKey, id)}
                    isInvalid={isSecondRunnerInvalid}
                    isDisabled={isReadOnly}
                  >
                    <Label>Second Runner Up (3rd Place)</Label>
                    <Autocomplete.Trigger>
                      <Autocomplete.Value/>
                      <Autocomplete.ClearButton/>
                      <Autocomplete.Indicator/>
                    </Autocomplete.Trigger>
                    <Autocomplete.Popover>
                      <Autocomplete.Filter filter={contains}>
                        <SearchField autoFocus name='search' variant='secondary'>
                          <SearchField.Group>
                            <SearchField.SearchIcon />
                            <SearchField.Input placeholder='Search...' />
                            <SearchField.ClearButton />
                          </SearchField.Group>
                        </SearchField>
                        <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                          {eventCubers.map((cuber, index) => (
                            <ListBox.Item key={cuber.id.toString()} id={cuber.id.toString()} textValue={cuber.name}>
                              <div className='flex justify-between items-center w-full'>
                                <span>{index+1} - {cuber.name.split('(')[0].trim()}</span>
                                {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                              </div>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Autocomplete.Filter>
                    </Autocomplete.Popover>
                    <ErrorMessage>{!!isSecondRunnerInvalid && <>Competitor already selected in this event</>}</ErrorMessage>
                  </Autocomplete>
                </div>
              );
            })}

            <Separator/>

            <div className='flex flex-col gap-4'>
              <Checkbox 
                isSelected={termsAccepted} 
                onChange={setTermsAccepted}
                isDisabled={isReadOnly}
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator/>
                  </Checkbox.Control>
                  I confirm my predictions are final and accept the rules.
                </Checkbox.Content>
              </Checkbox>
              
              <Button 
                variant='primary'
                type={isReadOnly ? 'button' : 'submit'} 
                isDisabled={isReadOnly || hasAnyDuplicates || !termsAccepted}
                isPending={isLoading}
                className='w-full font-bold text-lg py-6'
              >
                {isReadOnly 
                  ? 'Prediction Locked In 🔒' 
                  : isSubmitted 
                  ? 'Update Prediction'
                  : hasAnyDuplicates 
                  ? 'Fix Errors to Submit' 
                  : 'Submit Prediction'}
              </Button>
            </div>
          </Form>
        </Card.Content>
      </Card>
    </>
  );
}
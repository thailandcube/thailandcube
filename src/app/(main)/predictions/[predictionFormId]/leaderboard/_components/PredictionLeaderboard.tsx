'use client';

import {
  Button,
  Card,
  Chip,
  Modal,
  Separator,
  Table,
  useOverlayState,
} from '@heroui/react';
import { Competitor, PredictionEventCompetitor, PredictionForm, PredictionRecord, PredictionSubmission, User } from '@/generated/prisma/client';
import { useMemo, useState } from 'react';
import { extractLatinName } from '@/app/utils/ExtractLatinName';
import { EventCodeToFullMap } from '@/app/utils/EnumMapper';

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

interface Props {
  form: PredictionForm;
  submissions: SubmissionWithPredictions[];
}

const PlacementMap: Record<string, string> = {
  'CHAMPION': 'Champion (1st)',
  'FIRST_RUNNER_UP': 'Runner Up (2nd)',
  'SECOND_RUNNER_UP': 'Second Runner Up (3rd)'
};

export default function PredictionLeaderboard({ form, submissions }: Props) {
  const state = useOverlayState();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithPredictions | null>(null);

  const handleViewPredictions = (submission: SubmissionWithPredictions) => {
    setSelectedSubmission(submission);
    state.open();
  }

  const groupedModalPredictions = useMemo(() => {
    if (!selectedSubmission)
      return {};

    const grouped: Record<string, RecordWithCuber[]> = {};

    for (const record of selectedSubmission.predictions) {
      if (!grouped[record.event])
        grouped[record.event] = [];

      grouped[record.event].push(record);
    }

    return grouped;
  }, [selectedSubmission]);

  const getPredictorName = (submission: SubmissionWithPredictions) => {
    const rawName = submission.user?.competitor?.name;
    return rawName ? extractLatinName(rawName) : `Player (User ${submission.userId})`;
  }

  const getPredictionStatusStyles = (status: string) => {
    switch (status) {
      case 'CORRECT': 
        return 'border-success-200 bg-success-50 text-success-800';
      case 'PODIUM': 
        return 'border-warning-200 bg-warning-50 text-warning-800';
      case 'INCORRECT': 
        return 'border-danger-200 bg-danger-50 text-danger-800';
      default: 
        return 'border-default-100 bg-default-50 text-default-800';
    }
  };

  return (
    <>
      <Card>
        <Card.Header className='flex flex-col items-start px-6 pt-6 pb-4'>
          <div className='flex justify-between w-full items-center'>
            <h1 className='text-2xl font-bold'>{form.name} Leaderboards</h1>
            <Chip color='accent' variant='soft'>{submissions.length} Entries</Chip>
          </div>
          <p className='text-default-500 text-sm mt-1'>
            View all submitted predictions and current scores for this competition.
          </p>
        </Card.Header>
        <Separator/>
        <Card.Content className='px-6 py-6'>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label='Submission leaderboard table'>
                <Table.Header>
                  <Table.Column isRowHeader>RANK</Table.Column>
                  <Table.Column>PLAYER</Table.Column>
                  <Table.Column>WCA ID</Table.Column>
                  <Table.Column>SCORE</Table.Column>
                  <Table.Column>SUBMITTED AT</Table.Column>
                  <Table.Column>ACTIONS</Table.Column>
                </Table.Header>
                <Table.Body renderEmptyState={() => <p className='text-2xl font-semibold text-center mx-auto'>No submissions yet.</p>}>
                  {submissions.map((sub, index) => (
                    <Table.Row key={sub.id}>
                      <Table.Cell>
                        <span className='font-bold text-default-600'>#{index+1}</span>
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

      <Modal state={state}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger/>
              <Modal.Header>
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
                    
                    const sortedRecords = [...records].sort((a, b) => 
                    {
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
                <Button variant='primary' onPress={() => state.close()}>
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
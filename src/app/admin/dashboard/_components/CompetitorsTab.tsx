'use client';

import { deleteCompetitorFromCompetition, getCompetitorsByCompetitionId } from '@/app/actions/competitors';
import { getEventsInCompetition } from '@/app/actions/events';
import { registerNewCompetitor } from '@/app/actions/registrations';
import { CompetitorWithRegistrationsDTO } from '@/app/lib/dtos/CompetitorDTO';
import { EventCodeToFullMap } from '@/app/utils/EnumMapper';
import { Competition, Competitor, Event, EventType, Registration } from '@/generated/prisma/client';
import { FileArrowUp, PencilToSquare, PersonPencil, PersonPlus, TrashBin } from '@gravity-ui/icons';
import { 
  Table,
  Spinner,
  Button,
  AlertDialog,
  useOverlayState,
  toast,
  Modal,
  Form,
  Label,
  Input,
  Select,
  ListBox,
} from '@heroui/react';
import type { Key } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function CompetitorsTab({ competition, competitionId }: { competition: Competition, competitionId: string }) {
  const router = useRouter();

  const [competitors, setCompetitors] = useState<CompetitorWithRegistrationsDTO[]>([]);
  const [registrationId, setRegistrationId] = useState(1);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorWithRegistrationsDTO | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const deletionDialogState = useOverlayState();
  const addEditDialogState = useOverlayState();

  const fetchCompetitors = useCallback(async () => {
    const data = await getCompetitorsByCompetitionId(competitionId);
    setCompetitors(data ?? []);
  }, [competitionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompetitors();
  }, [fetchCompetitors]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEventsInCompetition(competitionId, {withRounds: false, withRegistrationEvents: false});

      setAllEvents(data ?? []);
    }

    fetchEvents();
  }, [competitionId]);

  const handleAddCompetitor = () => {
    const maxRegistrationId = competitors.length > 0 
      ? Math.max(...competitors.map((competitor) => {
          const reg = competitor.registrations.find(r => r.competitionId === competitionId);
          return reg ? reg.id : 0;
        })) 
      : 0;

    setRegistrationId(maxRegistrationId + 1);
    setSelectedCompetitor(null);
    addEditDialogState.open();
  }

  const handleEditCompetitor = (competitor: CompetitorWithRegistrationsDTO) => {
    const currentRegistration = competitor.registrations.find(r => r.competitionId === competitionId);
    
    setRegistrationId(currentRegistration?.id ?? 0);
    setSelectedCompetitor(competitor);
    addEditDialogState.open();
  }

  const handleDeleteCompetitor = (competitor: CompetitorWithRegistrationsDTO) => {
    setSelectedCompetitor(competitor);
    deletionDialogState.open();
  }

  const handleUpdate = () => {
    fetchCompetitors();
    router.refresh();
  };

  const sortedCompetitors = useMemo(() => {
    return [...competitors].sort((a, b) => {
      const regA = a.registrations.find(r => r.competitionId === competitionId)?.id ?? 0;
      const regB = b.registrations.find(r => r.competitionId === competitionId)?.id ?? 0;
      return regA - regB;
    });
  }, [competitors, competitionId]);

  return (
    <>
      <div className='flex justify-end mb-6 gap-4'>
        {/* TODO: Add modal for CSV file uploading */}
        <Button onPress={() => alert('Work in progress!')} isDisabled>
          <FileArrowUp/>
          Batch Add (Upload File)
        </Button>
        <Button onPress={() => handleAddCompetitor()}>
          <PersonPlus/>
          Add New Competitor
        </Button>
      </div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label='Competitors Table'>
            <Table.Header>
              <Table.Column isRowHeader>ID</Table.Column>
              <Table.Column>WCA ID</Table.Column>
              <Table.Column>Name</Table.Column>
              <Table.Column>Region</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body renderEmptyState={
              () => <p className='text-center py-6 font-bold'>No competitors data yet.</p>
            }>
              {
                sortedCompetitors.map((competitor) => {
                  const currentReg = competitor.registrations.find(r => r.competitionId === competitionId);
                  
                  console.log(competitor.name, currentReg);

                  return (
                    <Table.Row key={competitor.id}>
                      <Table.Cell>{currentReg?.id ?? 'N/A'}</Table.Cell>
                      <Table.Cell>{competitor?.wcaId ?? 'N/A'}</Table.Cell>
                      <Table.Cell>{competitor?.name ?? 'N/A'}</Table.Cell>
                      <Table.Cell><span className={`fi fi-${competitor.region.toLowerCase()}`}></span></Table.Cell>
                      <Table.Cell>
                        <div className='flex gap-4'>
                          <Button variant='primary' onPress={() => handleEditCompetitor(competitor)} isIconOnly><PencilToSquare/></Button>
                          <Button variant='danger' onPress={() => handleDeleteCompetitor(competitor)} isIconOnly><TrashBin/></Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              }
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <AddEditCompetitorModal state={addEditDialogState} competitor={selectedCompetitor} registrationId={registrationId} competition={competition} events={allEvents} onSuccess={handleUpdate}/>
      {selectedCompetitor && <ConfirmDeletionDialog state={deletionDialogState} competitor={selectedCompetitor} competition={competition} onSuccess={handleUpdate}/>}
    </>
  );
}

interface ModalDialogProps {
  state: ReturnType<typeof useOverlayState>;
  competition: Competition;
  competitor: CompetitorWithRegistrationsDTO;
  onSuccess: () => void;
}

interface AddModalProps extends Omit<ModalDialogProps, 'competitor'> {
  competitor: CompetitorWithRegistrationsDTO | null;
  registrationId: number;
  events: Event[];
}

function AddEditCompetitorModal({ state, competitor, registrationId, competition, events, onSuccess }: AddModalProps) {
  const [name, setName] = useState('');
  const [wcaId, setWcaId] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Key[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state.isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(competitor?.name ?? '');
      setWcaId(competitor?.wcaId ?? '');

      const compRegistration = competitor?.registrations.find(reg => reg.competitionId === competition.competitionId);
      const selectedEventIds = compRegistration?.events.map((e) => e.eventId.toString()) || [];
      setSelectedEvents(selectedEventIds as Key[]);
    }
  }, [competition.competitionId, competitor, state.isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.danger('Name is required.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        competitorId: competitor?.id.toString() ?? '',
        id: registrationId.toString(),
        name,
        wca_id: wcaId || '',
        region: competitor?.region ?? 'TH',
        ...Array.from(selectedEvents).reduce((acc, eventId) => {
          acc[eventId.toString()] = 'true';
          return acc;
        }, {} as Record<string, string>)
      };
      
      await registerNewCompetitor({ payload, competitionId: competition.competitionId, eventsInComp: events });
      
      toast.success(competitor ? 'Successfully updated competitor.' : 'Successfully added competitor.');
      onSuccess();
      state.close();
    }
    catch (error) {
      toast.danger('An error occurred while saving the competitor.');
      console.error(error);
    } 
    finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger/>
            <Modal.Header>
              <Modal.Icon className='bg-default text-foreground'>
                {competitor ? <PersonPencil/> : <PersonPlus/>}
              </Modal.Icon>
              <Modal.Header>
                <p className='text-lg font-semibold'>
                  {competitor ? `Edit ${competitor.name}` : 'Add New Competitor'}
                </p>
              </Modal.Header>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className='flex flex-col gap-2'>
                  <Label>Competitor ID</Label>
                  <Input 
                    value={registrationId.toString()} 
                    placeholder='Competitor ID (Auto-assigned)' 
                    disabled 
                    required
                  />
                  <Label>Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Full Name' 
                    required
                  />
                  <Label>WCA ID</Label>
                  <Input 
                    value={wcaId} 
                    onChange={(e) => setWcaId(e.target.value)}
                    placeholder='WCA ID (if any, e.g. 2018PRON02)'
                  />
                  <Select 
                    placeholder='Select events' 
                    selectionMode='multiple'
                    value={selectedEvents}
                    onChange={(keys) => setSelectedEvents(keys as Key[])}
                  >
                    <Label>Select Events</Label>
                    <Select.Trigger>
                      <Select.Value/>
                      <Select.Indicator/>
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox selectionMode='multiple'>
                        {
                          events.map((event) => {
                            const displayString = `${EventCodeToFullMap[event.event as EventType]} ${event.maxAge ? `(Max Age: ${event.maxAge})` : '(Open To All Age)'}`;

                            return (
                            <ListBox.Item key={event.id.toString()} id={event.id.toString()} textValue={displayString}>
                              <Label>
                                {displayString}
                              </Label>
                              <ListBox.ItemIndicator/>
                            </ListBox.Item>
                            )
                          })
                        }
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='tertiary' onPress={() => state.toggle()}>Cancel</Button>
              <Button onPress={() => handleSave()}>
                {competitor ? 'Save Changes' : 'Add Competitor'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function ConfirmDeletionDialog({ state, competitor, competition, onSuccess }: ModalDialogProps) {
  const handleDeletionConfirm = async () => {
    const result = await deleteCompetitorFromCompetition(competitor.id, competition.competitionId);

    if (!result) {
      toast.danger('An error occured while trying to delete.');
      state.close();
      return;
    }

    toast.success('Successfully deleted competitor.');
    onSuccess();
    state.close();
  }

  return (
    <AlertDialog isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger/>
            <AlertDialog.Header>
              <AlertDialog.Icon/>
              <AlertDialog.Heading>Confirm Deleting {competitor.name}?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              This action will permanently delete <strong>{competitor.name}</strong> from <strong>{competition.name}</strong>. This action cannot be undone.
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button onPress={() => state.toggle()} slot='close' variant='tertiary'>
                Cancel
              </Button>
              <Button onPress={() => handleDeletionConfirm()} slot='close' variant='danger'>
                Delete Competitor
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
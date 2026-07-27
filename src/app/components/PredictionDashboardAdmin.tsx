'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import 
{ 
    Card, 
    CardBody, 
    Tabs, 
    Tab, 
    Chip, 
    Button, 
    Divider,
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Autocomplete,
    AutocompleteItem
} from '@heroui/react';
import { PredictionForm, PredictionSubmission, PredictionRecord, PredictionEventCompetitor, User, Competitor, PredictionAnswer } from '@prisma/client';
import { extractLatinName } from '@/lib/ExtractLatinName';

type UserWithCompetitor = User & 
{
    competitor: Competitor | null;
};

type RecordWithCuber = PredictionRecord & 
{
    predictedCuber: PredictionEventCompetitor;
};

type SubmissionWithPredictions = PredictionSubmission & 
{
    user: UserWithCompetitor | null;
    predictions: RecordWithCuber[];
};

type FormWithData = PredictionForm & 
{
    _count: 
    {
        submissions: number;
        cubers: number;
    };
    submissions: SubmissionWithPredictions[];
    answers: PredictionAnswer[];
    cubers: PredictionEventCompetitor[];
};

interface Props 
{
    form: FormWithData;
}

const EventNameMap: Record<string, string> = 
{
    'E333': '3x3x3 Cube',
    'E222': '2x2x2 Cube',
    'E444': '4x4x4 Cube',
    'E555': '5x5x5 Cube',
    'E666': '6x6x6 Cube',
    'E777': '7x7x7 Cube',
    'E333BF': '3x3x3 Blindfolded',
    'E333FM': '3x3x3 Fewest Moves',
    'E333OH': '3x3x3 One-Handed',
    'CLOCK': 'Clock',
    'MINX': 'Megaminx',
    'PYRAM': 'Pyraminx',
    'SKEWB': 'Skewb',
    'SQ1': 'Square-1',
    'E444BF': '4x4x4 Blindfolded',
    'E555BF': '5x5x5 Blindfolded',
    'E333MBF': '3x3x3 Multi-Blind'
};

const PlacementMap: Record<string, string> = 
{
    'CHAMPION': 'Champion (1st)',
    'FIRST_RUNNER_UP': 'Runner Up (2nd)',
    'SECOND_RUNNER_UP': 'Second Runner Up (3rd)'
};

const PlacementsList = ['CHAMPION', 'FIRST_RUNNER_UP', 'SECOND_RUNNER_UP'];

const PredictionDashboardAdmin = ({ form }: Props) => 
{
    const router = useRouter();
    
    // Modal State
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithPredictions | null>(null);
    
    // Loading States for API Actions
    const [isGrading, setIsGrading] = useState(false);
    const [isSavingAnswers, setIsSavingAnswers] = useState(false);
    const [isTogglingLock, setIsTogglingLock] = useState(false);

    // Initialize the answers state from the database so previously saved answers show up
    const initialAnswers: Record<string, Record<string, string>> = {};
    if (form.answers) 
    {
        for (const ans of form.answers) 
        {
            if (!initialAnswers[ans.event]) 
            {
                initialAnswers[ans.event] = {};
            }
            initialAnswers[ans.event][ans.placement] = ans.actualCuberId.toString();
        }
    }
    const [answersState, setAnswersState] = useState<Record<string, Record<string, string>>>(initialAnswers);

    // Get unique events from the roster so we know which answer blocks to render
    const uniqueEvents = useMemo(() => 
    {
        const events = new Set<string>();
        const cuberList = form.cubers || []; 
        for (const cuber of cuberList) 
        {
            events.add(cuber.event);
        }
        return Array.from(events);
    }, [form.cubers]);

    const getStatus = () => 
    {
        const now = new Date();
        const open = new Date(form.openTime);
        const close = new Date(form.closeTime);

        if (form.isLocked) return { label: 'Locked', color: 'danger' as const };
        if (now < open) return { label: 'Upcoming', color: 'warning' as const };
        if (now >= open && now <= close) return { label: 'Active', color: 'success' as const };
        return { label: 'Closed', color: 'default' as const };
    };

    const status = getStatus();
    
    // Determine if the form is fully closed (deadline passed or manually locked)
    const isPastDeadline = new Date() > new Date(form.closeTime) || form.isLocked;

    const handleViewPredictions = (submission: SubmissionWithPredictions) => 
    {
        setSelectedSubmission(submission);
        onOpen();
    };

    // --- API Action Handlers --- //

    const handleAnswerChange = (eventCode: string, placement: string, cuberId: string) => 
    {
        setAnswersState((prev) => 
        ({
            ...prev,
            [eventCode]: {
                ...prev[eventCode],
                [placement]: cuberId
            }
        }));
    };

    const handleSaveAnswers = async () => 
    {
        setIsSavingAnswers(true);
        
        try 
        {
            const payload = [];
            
            for (const eventCode of Object.keys(answersState)) 
            {
                for (const placement of Object.keys(answersState[eventCode])) 
                {
                    const cuberId = answersState[eventCode][placement];
                    if (cuberId) 
                    {
                        payload.push({
                            event: eventCode,
                            placement: placement,
                            actualCuberId: parseInt(cuberId, 10)
                        });
                    }
                }
            }

            const res = await fetch(`/api/predictions/${form.id}/answers`, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: payload })
            });

            if (!res.ok) throw new Error('Failed to save answers');

            alert('Official answers saved successfully!');
            router.refresh();
        } 
        catch (error) 
        {
            console.error(error);
            alert('An error occurred while saving answers.');
        } 
        finally 
        {
            setIsSavingAnswers(false);
        }
    };

    const handleGradePredictions = async () => 
    {
        const confirmed = window.confirm('Are you sure you want to grade all predictions? Make sure you have saved the Official Answers first.');
        if (!confirmed) return;

        setIsGrading(true);

        try 
        {
            const res = await fetch(`/api/predictions/${form.id}/grade`, 
            {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Grading failed');

            alert('Predictions graded successfully!');
            router.refresh(); 
        } 
        catch (error) 
        {
            console.error(error);
            alert('An error occurred while grading predictions.');
        } 
        finally 
        {
            setIsGrading(false);
        }
    };

    const handleToggleLock = async () => 
    {
        const newLockState = !form.isLocked;
        const actionText = newLockState ? 'lock' : 'unlock';
        
        const confirmed = window.confirm(`Are you sure you want to ${actionText} this form?`);
        if (!confirmed) return;

        setIsTogglingLock(true);

        try 
        {
            const res = await fetch(`/api/predictions/${form.id}/lock`, 
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLocked: newLockState })
            });

            if (!res.ok) throw new Error(`Failed to ${actionText} submissions`);

            alert(`Submissions have been manually ${newLockState ? 'closed' : 'opened'}.`);
            router.refresh(); 
        } 
        catch (error) 
        {
            console.error(error);
            alert(`An error occurred while trying to ${actionText} submissions.`);
        } 
        finally 
        {
            setIsTogglingLock(false);
        }
    };

    // --- Rendering Helpers --- //

    const groupedModalPredictions = useMemo(() => 
    {
        if (!selectedSubmission) return {};
        
        const grouped: Record<string, RecordWithCuber[]> = {};
        for (const record of selectedSubmission.predictions) 
        {
            if (!grouped[record.event]) 
            {
                grouped[record.event] = [];
            }
            grouped[record.event].push(record);
        }
        return grouped;
    }, [selectedSubmission]);

    const getPredictorName = (sub: SubmissionWithPredictions) => 
    {
        const rawName = sub.user?.competitor?.name;
        return rawName ? extractLatinName(rawName) : `Player (User ${sub.userId})`;
    };

    const getPredictionStatusStyles = (status: string) => 
    {
        switch (status) 
        {
            case 'CORRECT': return 'border-success-200 bg-success-50 text-success-800';
            case 'PODIUM': return 'border-warning-200 bg-warning-50 text-warning-800';
            case 'INCORRECT': return 'border-danger-200 bg-danger-50 text-danger-800';
            default: return 'border-default-100 bg-default-50 text-default-800';
        }
    };

    return (
        <>
            <div className='flex flex-col gap-6'>
                {/* Header Area */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold flex items-center gap-3'>
                            {form.name}
                            <Chip color={status.color} variant='flat' size='sm'>
                                {status.label}
                            </Chip>
                        </h1>
                        <p className='text-default-500 mt-1'>
                            Competition ID: <span className='font-mono text-foreground'>{form.id}</span>
                        </p>
                    </div>
                    
                    <div className='flex gap-2'>
                        <Button 
                            color='primary' 
                            variant='flat'
                            isLoading={isGrading}
                            onPress={handleGradePredictions}
                        >
                            Grade Predictions
                        </Button>
                        <Button 
                            color={form.isLocked ? 'success' : 'danger'} 
                            variant='flat'
                            isLoading={isTogglingLock}
                            onPress={handleToggleLock}
                        >
                            {form.isLocked ? 'Open Submissions' : 'Close Submissions'}
                        </Button>
                    </div>
                </div>

                <Tabs aria-label='Dashboard Options' color='primary' variant='underlined'>
                    
                    {/* Tab: Overview */}
                    <Tab key='overview' title='Overview'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                            <Card>
                                <CardBody className='py-8 text-center'>
                                    <p className='text-default-500 text-sm font-medium'>Total Submissions</p>
                                    <p className='text-4xl font-bold mt-2'>{form._count.submissions}</p>
                                </CardBody>
                            </Card>
                            
                            <Card>
                                <CardBody className='py-8 text-center'>
                                    <p className='text-default-500 text-sm font-medium'>Competitors Loaded</p>
                                    <p className='text-4xl font-bold mt-2'>{form._count.cubers}</p>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className='py-8 text-center flex flex-col justify-center gap-2'>
                                    <div>
                                        <span className='text-default-500 text-xs'>OPENS</span>
                                        <p className='font-medium text-sm'>
                                            {new Date(form.openTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <Divider />
                                    <div>
                                        <span className='text-default-500 text-xs'>CLOSES</span>
                                        <p className='font-medium text-sm'>
                                            {new Date(form.closeTime).toLocaleString()}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>

                    {/* Tab: Submissions Leaderboard */}
                    <Tab key='submissions' title={`Submissions (${form._count.submissions})`}>
                        <Card className='mt-4'>
                            <CardBody className='px-0 py-0'>
                                <Table aria-label='Submissions admin table' isStriped shadow='none'>
                                    <TableHeader>
                                        <TableColumn>RANK</TableColumn>
                                        <TableColumn>PLAYER</TableColumn>
                                        <TableColumn>WCA ID</TableColumn>
                                        <TableColumn>SCORE</TableColumn>
                                        <TableColumn>SUBMITTED AT</TableColumn>
                                        <TableColumn align='center'>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent={'No submissions yet.'}>
                                        {form.submissions.map((sub, index) => (
                                            <TableRow key={sub.id}>
                                                <TableCell>
                                                    <span className='font-bold text-default-600'>#{index + 1}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className='font-medium'>
                                                        {getPredictorName(sub)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {sub.wcaId ? (
                                                        <Chip size='sm' variant='faded'>{sub.wcaId}</Chip>
                                                    ) : (
                                                        <span className='text-default-400'>-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip color={sub.score > 0 ? 'success' : 'default'} variant='flat'>
                                                        {sub.score} pts
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <span className='text-sm text-default-500'>
                                                        {new Date(sub.createdAt).toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button 
                                                        size='sm' 
                                                        variant='flat' 
                                                        color='primary'
                                                        onPress={() => handleViewPredictions(sub)}
                                                    >
                                                        View Picks
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Tab: Official Answers */}
                    <Tab key='answers' title='Official Answers'>
                        <Card className='mt-4'>
                            <CardBody className='flex flex-col gap-6 py-6 px-6 md:px-8'>
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

                                <Divider />

                                {uniqueEvents.map((eventCode) => 
                                {
                                    const eventName = EventNameMap[eventCode] || eventCode;
                                    const cubersForEvent = form.cubers.filter(c => c.event === eventCode);

                                    return (
                                        <div key={eventCode} className='flex flex-col gap-4 bg-default-50 p-5 rounded-lg border border-default-100'>
                                            <h3 className='font-semibold text-lg text-default-800'>{eventName}</h3>
                                            
                                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                                {PlacementsList.map((placement) => (
                                                    <Autocomplete 
                                                        key={`${eventCode}-${placement}`}
                                                        label={PlacementMap[placement]} 
                                                        variant='bordered'
                                                        isDisabled={!isPastDeadline}
                                                        selectedKey={answersState[eventCode]?.[placement] || null}
                                                        onSelectionChange={(key) => handleAnswerChange(eventCode, placement, key as string)}
                                                    >
                                                        {cubersForEvent.map(cuber => (
                                                            <AutocompleteItem key={cuber.id.toString()} textValue={cuber.name}>
                                                                <div className='flex justify-between items-center w-full'>
                                                                    <span>{extractLatinName(cuber.name)}</span>
                                                                    {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                                                                </div>
                                                            </AutocompleteItem>
                                                        ))}
                                                    </Autocomplete>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className='flex justify-end mt-4'>
                                    <Button 
                                        color='primary' 
                                        className='w-full md:w-auto font-semibold'
                                        size='lg'
                                        isDisabled={!isPastDeadline}
                                        isLoading={isSavingAnswers}
                                        onPress={handleSaveAnswers}
                                    >
                                        Save Official Answers
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Tab: Roster */}
                    <Tab key='roster' title='Event Roster'>
                        <Card className='mt-4'>
                            <CardBody>
                                <p className='text-default-500'>
                                    Competitor roster placeholder.
                                </p>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Tab: Settings */}
                    <Tab key='settings' title='Settings'>
                        <Card className='mt-4'>
                            <CardBody>
                                <p className='text-default-500'>
                                    Form settings (Change times, manual lock override) placeholder.
                                </p>
                            </CardBody>
                        </Card>
                    </Tab>
                    
                </Tabs>
            </div>

            {/* Modal: View Player Picks */}
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange} 
                scrollBehavior='inside'
                size='lg'
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>
                                <span className='text-lg font-bold'>
                                    {selectedSubmission ? `${getPredictorName(selectedSubmission)}'s Picks` : 'Player Predictions'}
                                </span>
                                <span className='text-xs font-normal text-default-400'>
                                    Form: {form.name} | Total Score: {selectedSubmission?.score} pts
                                </span>
                            </ModalHeader>
                            <ModalBody className='py-4'>
                                <div className='flex flex-col gap-6'>
                                    {Object.entries(groupedModalPredictions).map(([eventCode, records]) => 
                                    {
                                        const eventName = EventNameMap[eventCode] || eventCode;
                                        
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
                                                                <Chip size='sm' variant='flat' className='font-mono bg-white/50 dark:bg-black/20'>
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
                            </ModalBody>
                            <ModalFooter>
                                <Button color='default' variant='light' onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default PredictionDashboardAdmin;
'use client';

import React, { useState, useMemo } from 'react';
import 
{ 
    Card, 
    CardHeader, 
    CardBody, 
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell,
    Chip,
    Divider,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from '@heroui/react';
import { PredictionForm, PredictionSubmission, PredictionRecord, PredictionEventCompetitor, User, Competitor } from '@prisma/client';
import { extractLatinName } from '@/lib/ExtractLatinName';

// 1. Extend the types to include the nested User and Competitor data
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

interface Props 
{
    form: PredictionForm;
    submissions: SubmissionWithPredictions[];
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

const PredictionLeaderboard = ({ form, submissions }: Props) => 
{
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithPredictions | null>(null);

    const handleViewPredictions = (submission: SubmissionWithPredictions) => 
    {
        setSelectedSubmission(submission);
        onOpen();
    };

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

    // 2. Safely check for the name before extracting it to satisfy TypeScript
    const getPredictorName = (sub: SubmissionWithPredictions) => 
    {
        const rawName = sub.user?.competitor?.name;
        return rawName ? extractLatinName(rawName) : `Player (User ${sub.userId})`;
    };

    // Helper to color the individual predictions based on their graded status
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
            <Card>
                <CardHeader className='flex flex-col items-start px-6 pt-6 pb-4'>
                    <div className='flex justify-between w-full items-center'>
                        <h1 className='text-2xl font-bold'>{form.name} Leaderboard</h1>
                        <Chip color='primary' variant='flat'>{submissions.length} Entries</Chip>
                    </div>
                    <p className='text-default-500 text-sm mt-1'>
                        View all submitted predictions and current scores for this competition.
                    </p>
                </CardHeader>

                <Divider />

                <CardBody className='px-6 py-6'>
                    <Table aria-label='Submissions leaderboard table' isStriped>
                        <TableHeader>
                            <TableColumn>RANK</TableColumn>
                            <TableColumn>PLAYER</TableColumn>
                            <TableColumn>WCA ID</TableColumn>
                            <TableColumn>SCORE</TableColumn>
                            <TableColumn>SUBMITTED AT</TableColumn>
                            <TableColumn align='center'>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={'No submissions yet.'}>
                            {submissions.map((sub, index) => (
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

export default PredictionLeaderboard;
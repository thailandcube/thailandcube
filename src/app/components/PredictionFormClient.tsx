'use client';

import React, { useState, useMemo, useEffect } from 'react';
import 
{ 
    Card, 
    CardHeader, 
    CardBody, 
    Input, 
    Button, 
    Divider,
    Checkbox,
    Autocomplete,
    AutocompleteItem,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    addToast,
    Link
} from '@heroui/react';
import { PredictionForm, PredictionEventCompetitor, PredictionSubmission, PredictionRecord } from '@prisma/client';
import { useSession, signIn } from 'next-auth/react';

type SubmissionWithRecords = PredictionSubmission & 
{
    predictions: PredictionRecord[];
};

interface Props 
{
    form: PredictionForm;
    roster: PredictionEventCompetitor[];
    existingSubmission?: SubmissionWithRecords | null;
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

const PredictionFormClient = ({ form, roster, existingSubmission }: Props) => 
{
    const { data: session, status } = useSession();

    const isSubmitted = !!existingSubmission;

    const [name, setName] = useState('');
    const [wcaId, setWcaId] = useState('');
    const [wantPrize, setWantPrize] = useState(existingSubmission ? existingSubmission.wantsPrize : false);
    const [termsAccepted, setTermsAccepted] = useState(isSubmitted);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize predictions from the database if they exist
    const initialPredictions: Record<string, number> = {};
    if (existingSubmission) 
    {
        existingSubmission.predictions.forEach(p => 
        {
            initialPredictions[`${p.event}_${p.placement}`] = p.predictedCuberId;
        });
    }
    const [predictions, setPredictions] = useState<Record<string, number>>(initialPredictions);

    const now = new Date();
    const openTime = new Date(form.openTime);
    const closeTime = new Date(form.closeTime);

    const isUpcoming = now < openTime && !form.isLocked;
    const isClosed = now > closeTime || form.isLocked;
    
    // Determine if the form should be read-only
    const isReadOnly = isClosed && isSubmitted;

    const uniqueEvents = useMemo(() => 
    {
        return Array.from(new Set(roster.map((c) => c.event)));
    }, [roster]);

    const getCubersForEvent = (eventCode: string) => 
    {
        return roster
            .filter((c) => c.event === eventCode)
            .sort((a, b) => a.pos - b.pos);
    };

    const handleSelectionChange = (key: string, competitorId: React.Key | null) => 
    {
        setPredictions((prev) => 
        ({
            ...prev,
            [key]: Number(competitorId)
        }));
    };

    const checkIsDuplicate = (key: string, eventCode: string) => 
    {
        const val = predictions[key];
        
        if (!val) return false;

        const allValsInEvent = [
            predictions[`${eventCode}_CHAMPION`],
            predictions[`${eventCode}_FIRST_RUNNER_UP`],
            predictions[`${eventCode}_SECOND_RUNNER_UP`]
        ];

        return allValsInEvent.filter((v) => v === val).length > 1;
    };

    const hasAnyDuplicates = useMemo(() => 
    {
        for (const eventCode of uniqueEvents) 
        {
            const selectedIds = [
                predictions[`${eventCode}_CHAMPION`],
                predictions[`${eventCode}_FIRST_RUNNER_UP`],
                predictions[`${eventCode}_SECOND_RUNNER_UP`]
            ].filter(Boolean); 

            if (new Set(selectedIds).size !== selectedIds.length) 
            {
                return true;
            }
        }
        
        return false;
    }, [predictions, uniqueEvents]);

    const handleSubmit = async (e: React.FormEvent) => 
    {
        e.preventDefault();
        
        if (hasAnyDuplicates)
        {
            alert('Please fix the duplicate selections before submitting.');
            return;
        }

        if (!termsAccepted) 
        {
            alert('You must accept the terms to submit.');
            return;
        }

        if (!session?.user?.id) 
        {
            alert('You must be logged in to submit.');
            return;
        }

        setIsLoading(true);

        try 
        {
            const predictionsPayload = [];

            for (const eventCode of uniqueEvents) 
            {
                const championId = predictions[`${eventCode}_CHAMPION`];
                const firstRunnerUpId = predictions[`${eventCode}_FIRST_RUNNER_UP`];
                const secondRunnerUpId = predictions[`${eventCode}_SECOND_RUNNER_UP`];

                if (championId || firstRunnerUpId || secondRunnerUpId) 
                {
                    predictionsPayload.push(
                    {
                        event: eventCode,
                        championId: championId ?? null,
                        firstRunnerUpId: firstRunnerUpId ?? null,
                        secondRunnerUpId: secondRunnerUpId ?? null,
                    });
                }
            }

            const payload = 
            {
                predictionFormId: form.id,
                userId: session.user.id,
                wcaId: wcaId || null,
                wantPrize: wantPrize,
                predictions: predictionsPayload
            };

            console.log('Submitting Payload:', payload);
            
            const res = await fetch('/api/predictions/submit', 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok)
            {
                addToast({title: 'Submission Failed', color: 'danger'});
                throw new Error('Submission failed');
            }
           
            addToast({title: isSubmitted ? 'Prediction updated successfully!' : 'Prediction submitted successfully!', color: 'success'});
            alert(isSubmitted ? 'Prediction updated successfully!' : 'Prediction submitted successfully!');
            window.location.reload(); 
        } 
        catch (error) 
        {
            console.error(error);
            alert('Failed to submit prediction.');
        } 
        finally 
        {
            setIsLoading(false);
        }
    };

    const loginModal = (
        <Modal 
            isOpen={status === 'unauthenticated'} 
            hideCloseButton={true} 
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader className='flex flex-col gap-1'>Authentication Required</ModalHeader>
                <ModalBody>
                    <p>You must be logged in to participate in the prediction game.</p>
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' onPress={() => signIn('wca')}>
                        Log In with WCA
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    useEffect(() => 
    {
        const fetchUserData = async () => 
        {
            if (!session?.user?.id) 
            {
                return;
            }

            try 
            {
                const response = await fetch(`${process.env.NEXT_PUBLIC_WCA_URL}/api/v0/users/${session.user.id}`);
                const data = await response.json();
                
                setWcaId(data.user.wca_id ?? null);
                setName(data.user.name ?? null);
            } 
            catch (error) 
            {
                console.error('Failed to fetch WCA user data:', error);
            }
        };

        fetchUserData();
    }, [session]);

    if (isUpcoming) 
    {
        return (
            <>
                {loginModal}
                <Card className='text-center py-12'>
                    <CardBody>
                        <h2 className='text-2xl font-bold'>Hold your horses! 🐎</h2>
                        <p className='text-center text-default-500 mt-2'>
                            Submissions for {form.name} open on {openTime.toLocaleString()}.
                        </p>
                    </CardBody>
                </Card>
            </>
        );
    }

    if (isClosed && !isSubmitted) 
    {
        return (
            <>
                {loginModal}
                <Card className='text-center py-12'>
                    <CardBody>
                        <h2 className='text-2xl font-bold'>Submissions Closed 🔒</h2>
                        <p className='text-center text-default-500 mt-2'>
                            {form.isLocked 
                                ? `Submissions for ${form.name} have been locked by an admin.` 
                                : `We are no longer accepting predictions for ${form.name}.`}
                        </p>
                    </CardBody>
                </Card>
            </>
        );
    }

    return (
        <>
            {loginModal}
            <Card>
                <CardHeader className='flex flex-col items-start px-6 pt-6 pb-4'>
                    <div className='flex justify-between w-full items-center'>
                        <h1 className='text-2xl font-bold'>{form.name}</h1>
                        <Chip color={isClosed ? 'default' : 'success'} variant='flat'>
                            {isClosed ? 'Closed' : 'Open'}
                        </Chip>
                    </div>
                    <p className='text-default-500 text-sm mt-1'>
                        Closes on {closeTime.toLocaleString()}
                    </p>
                    {form.isThaiOnly && (
                        <Chip color='secondary' variant='dot' size='sm' className='mt-2'>
                            Thai Nationals Edition (TH Cubers Only)
                        </Chip>
                    )}
                </CardHeader>
                
                <Divider />
                
                <CardBody className='px-6 py-6'>
                    {isReadOnly ? (
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
                    ) : null}

                    {/* Rules Section */}
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

                    <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                        
                        <div className='flex flex-col gap-4'>
                            <h2 className='text-lg font-semibold'>Your Information</h2>
                            <Input 
                                isRequired
                                type='text' 
                                label='Predictor Name' 
                                variant='bordered'
                                value={name}
                                onValueChange={setName}
                                isDisabled
                            />
                            <Input 
                                type='text' 
                                label='WCA ID (Optional)' 
                                variant='bordered'
                                value={wcaId}
                                onValueChange={setWcaId}
                                placeholder='e.g. 2024KASE01'
                                isDisabled
                            />

                            <Checkbox 
                                isSelected={wantPrize} 
                                onValueChange={setWantPrize}
                                isDisabled={isReadOnly}
                            >
                                I wish to receive a prize if I am eligible.
                            </Checkbox>
                        </div>

                        <Divider />

                        {uniqueEvents.map((eventCode) => 
                        {
                            const eventCubers = getCubersForEvent(eventCode);
                            const eventName = EventNameMap[eventCode] || eventCode;

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
                                        label='Champion (1st Place)'
                                        variant='bordered'
                                        selectedKey={predictions[champKey]?.toString() || undefined}
                                        onSelectionChange={(id) => handleSelectionChange(champKey, id)}
                                        isInvalid={isChampInvalid}
                                        errorMessage={isChampInvalid ? 'Competitor already selected in this event' : undefined}
                                        isDisabled={isReadOnly}
                                    >
                                        {eventCubers.map((cuber, index) => (
                                            <AutocompleteItem key={cuber.id.toString()} textValue={cuber.name}>
                                                <div className='flex justify-between items-center w-full'>
                                                    <span>{index+1} - {cuber.name.split('(')[0].trim()}</span>
                                                    {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                                                </div>
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>

                                    <Autocomplete
                                        isRequired
                                        label='Runner Up (2nd Place)'
                                        variant='bordered'
                                        selectedKey={predictions[firstRunnerKey]?.toString() || undefined}
                                        onSelectionChange={(id) => handleSelectionChange(firstRunnerKey, id)}
                                        isInvalid={isFirstRunnerInvalid}
                                        errorMessage={isFirstRunnerInvalid ? 'Competitor already selected in this event' : undefined}
                                        isDisabled={isReadOnly}
                                    >
                                        {eventCubers.map((cuber, index) => (
                                            <AutocompleteItem key={cuber.id.toString()} textValue={cuber.name}>
                                                <div className='flex justify-between items-center w-full'>
                                                    <span>{index+1} - {cuber.name.split('(')[0].trim()}</span>
                                                    {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                                                </div>
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>

                                    <Autocomplete
                                        isRequired
                                        label='Second Runner Up (3rd Place)'
                                        variant='bordered'
                                        selectedKey={predictions[secondRunnerKey]?.toString() || undefined}
                                        onSelectionChange={(id) => handleSelectionChange(secondRunnerKey, id)}
                                        isInvalid={isSecondRunnerInvalid}
                                        errorMessage={isSecondRunnerInvalid ? 'Competitor already selected in this event' : undefined}
                                        isDisabled={isReadOnly}
                                    >
                                        {eventCubers.map((cuber, index) => (
                                            <AutocompleteItem key={cuber.id.toString()} textValue={cuber.name}>
                                                <div className='flex justify-between items-center w-full'>
                                                    <span>{index+1} - {cuber.name.split('(')[0].trim()}</span>
                                                    {cuber.wcaId && <span className='text-xs text-default-400'>{cuber.wcaId}</span>}
                                                </div>
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>
                                </div>
                            );
                        })}

                        <Divider />

                        <div className='flex flex-col gap-4'>
                            <Checkbox 
                                isSelected={termsAccepted} 
                                onValueChange={setTermsAccepted}
                                isDisabled={isReadOnly}
                            >
                                I confirm my predictions are final and accept the rules.
                            </Checkbox>
                            
                            <Button 
                                color={isReadOnly ? 'success' : 'primary'} 
                                type={isReadOnly ? 'button' : 'submit'} 
                                isDisabled={isReadOnly || hasAnyDuplicates || !termsAccepted}
                                isLoading={isLoading}
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

                    </form>
                </CardBody>
            </Card>
            
            <div className='mx-auto mt-5 text-center'>
                <Button as={Link} href={`/predictions/${form.id}/leaderboard`} variant='flat' color='secondary'>View Leaderboard</Button>
            </div>
        </>
    );
};

export default PredictionFormClient;
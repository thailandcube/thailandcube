'use client';

import { ArrowsRotateRight, ChevronsExpandUpRight, PauseFill, PlayFill } from '@gravity-ui/icons';
import { Button, Input, Card } from '@heroui/react';
import { useEffect, useState, useRef } from 'react';

const Page = () => {
    const [title, setTitle] = useState('');
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [targetTime, setTargetTime] = useState<Date|null>(null);
    const [isCounting, setIsCounting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const fiveMinsAudioRef = useRef<HTMLAudioElement|null>(null);
    const timesUpAudioRef = useRef<HTMLAudioElement|null>(null);
    const alarmAudioRef = useRef<HTMLAudioElement|null>(null);
    const hasPlayedFiveMinsRef = useRef(false);
    const hasPlayedTimesUpRef = useRef(false);
    const hasPlayedAlarmRef = useRef(false);

    useEffect(() => {
        fiveMinsAudioRef.current = new Audio('/audio/countdown-5-mins-left.mp3');
        timesUpAudioRef.current = new Audio('/audio/countdown-times-up.mp3');
        alarmAudioRef.current = new Audio('/audio/countdown-alarm.mp3');
    }, []);

    const handleStartTimer = () => {
        if (!targetTime) {
            const nextOneHour = new Date();
            nextOneHour.setHours(nextOneHour.getHours() + 1);
            nextOneHour.setSeconds(nextOneHour.getSeconds() + 1);

            toggleFullscreen();
            setTargetTime(nextOneHour);
        }

        if (fiveMinsAudioRef.current) fiveMinsAudioRef.current.load();
        if (timesUpAudioRef.current) timesUpAudioRef.current.load();
        if (alarmAudioRef.current) alarmAudioRef.current.load();

        setIsCounting(true);
    };

    const handlePauseTimer = () => {
        setIsCounting(false);
    };

    const handleResetTimer = () => {
        setIsCounting(false);
        setTargetTime(null);
        setHours(1);
        setMinutes(0);
        setSeconds(0);

        hasPlayedFiveMinsRef.current = false;
        hasPlayedTimesUpRef.current = false;
        hasPlayedAlarmRef.current = false;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (isCounting && targetTime) {
                const now = new Date();
                const diff = targetTime.getTime() - now.getTime();

                if (diff <= 5 * 60 * 1000 && diff > 0 && !hasPlayedFiveMinsRef.current) {
                    if (fiveMinsAudioRef.current) {
                        fiveMinsAudioRef.current.play().catch(e => console.log('Audio blocked:', e));
                    }
                    hasPlayedFiveMinsRef.current = true;
                }

                if (diff <= 0) {
                    setIsCounting(false);

                    if (alarmAudioRef.current) {
                        alarmAudioRef.current.play().catch(e => console.log('Audio blocked:', e));

                        setTimeout(() => {
                            if (alarmAudioRef.current) {
                                alarmAudioRef.current.pause();
                                alarmAudioRef.current.currentTime = 0;
                            }
                        }, 7.5 * 1000);
                    }

                    hasPlayedAlarmRef.current = true;

                    if (timesUpAudioRef.current) {
                        timesUpAudioRef.current.play().catch(e => console.log('Audio blocked:', e));
                    }

                    hasPlayedTimesUpRef.current = true;

                    return;
                }

                const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setHours(hrs);

                const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setMinutes(min);

                const sec = Math.floor((diff % (1000 * 60)) / 1000);
                setSeconds(sec);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isCounting, targetTime]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.error('Error entering fullscreen:', e));
        } else {
            document.exitFullscreen().catch(e => console.error('Error exiting fullscreen:', e));
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const format = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className='min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center font-sans'>
            <div className='w-full max-w-4xl mx-auto'>
                <div className={`mb-10 w-full transition-opacity ${isFullscreen ? 'hidden' : 'block'}`}>
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder='Title' 
                      className='w-full text-4xl font-bold text-center shadow-none'
                    />
                </div>

                <div className='grid grid-cols-3 gap-3 sm:gap-6 justify-center items-center w-full'>
                    <Card className='shadow-lg border-none'>
                        <Card.Content className='flex flex-col justify-center items-center py-6 sm:py-10'>
                            <span className='text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter'>
                                {hours}
                            </span>
                            <p className='text-xs sm:text-sm md:text-lg uppercase font-semibold text-gray-500 mt-2 tracking-widest'>
                                Hour
                            </p>
                        </Card.Content>
                    </Card>
                    <Card className='shadow-lg border-none'>
                        <Card.Content className='flex flex-col justify-center items-center py-6 sm:py-10'>
                            <span className='text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter'>
                                {format(minutes)}
                            </span>
                            <p className='text-xs sm:text-sm md:text-lg uppercase font-semibold text-gray-500 mt-2 tracking-widest'>
                                Minutes
                            </p>
                        </Card.Content>
                    </Card>
                    <Card className='shadow-lg border-none'>
                        <Card.Content className='flex flex-col justify-center items-center py-6 sm:py-10'>
                            <span className='text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter'>
                                {format(seconds)}
                            </span>
                            <p className='text-xs sm:text-sm md:text-lg uppercase font-semibold text-gray-500 mt-2 tracking-widest'>
                                Seconds
                            </p>
                        </Card.Content>
                    </Card>
                </div>
                
                <div className={`flex justify-center items-center mt-10 gap-4 sm:gap-6 mx-auto ${isFullscreen ? 'hidden' : ''}`}>
                    <Button onPress={handleStartTimer} className='bg-green-500/20 text-green-600 w-20 h-20 sm:w-24 sm:h-24 min-w-[5rem] sm:min-w-[6rem] rounded-xl' isIconOnly aria-label='Start Timer'>
                        <PlayFill className='w-8 h-8 sm:w-10 sm:h-10'/>
                    </Button>
                    <Button onPress={handlePauseTimer} className='bg-yellow-500/20 text-yellow-600 w-20 h-20 sm:w-24 sm:h-24 min-w-[5rem] sm:min-w-[6rem] rounded-xl' isIconOnly aria-label='Pause Timer'>
                        <PauseFill className='w-8 h-8 sm:w-10 sm:h-10'/>
                    </Button>
                    <Button onPress={handleResetTimer} className='bg-blue-500/20 text-blue-600 w-20 h-20 sm:w-24 sm:h-24 min-w-[5rem] sm:min-w-[6rem] rounded-xl' isIconOnly aria-label='Reset Timer'>
                        <ArrowsRotateRight className='w-8 h-8 sm:w-10 sm:h-10'/>
                    </Button>
                </div>

                <div className={`flex justify-center mt-6 sm:mt-8 ${isFullscreen ? 'hidden' : ''}`}>
                    <Button onPress={toggleFullscreen} variant='ghost' className='text-gray-500'>
                        <ChevronsExpandUpRight className='w-5 h-5 mr-2'/> Click for fullscreen
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Page;
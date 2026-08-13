'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getResultsInRound } from '@/app/actions/results';
import { numToFormatted } from '@/app/utils/DateTimeFormatter';
import { EventCodeToFullMap } from '@/app/utils/EnumMapper';
import type { Competitor, Event, Result, Round } from '@/generated/prisma/client';
import { 
  Table,
  Spinner,
} from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';

interface ResultTableProps {
  competitionId: string;
  event: Event;
  round: Round;
}

interface ExtendedResult extends Result {
  competitor: Competitor;
  rank?: number;
}

interface SplittedResult {
  valued: ExtendedResult[];
  blank: ExtendedResult[];
}

export default function ResultTable({ competitionId, event, round }: ResultTableProps) {
  const t = useTranslations('ResultTable');
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<SplittedResult | null>(null);

  const getTitleString = () => {
    const eventString = EventCodeToFullMap[event.event];
    const ageString = locale === 'en' ? `Age ${event.maxAge} and Under` : `รุ่นอายุไม่เกิน ${event.maxAge} ปี`;
    const roundString = `${t('round')} ${round?.round}`;

    if (!(eventString && ageString && roundString))
      return '';
    else if (event.maxAge)
      return `${eventString} (${ageString}) ${roundString}`;
    else
      return `${eventString} ${roundString}`;
  }

  const getProceedingString = () => {
    const isPercentage = !Number.isInteger(round?.proceed);
    const valueString = isPercentage && round?.proceed ? `${round?.proceed*100}%` : round?.proceed;

    return locale === 'en' ? `Advancement: Top ${valueString} competitors advance to the next round` : `เงื่อนไขการเข้ารอบ: ผู้เข้าแข่งขัน ${valueString} ${isPercentage ? '' : 'อันดับ'}แรก ผ่านเข้าสู่รอบถัดไป`;
  }

  useEffect(() => {
    const fetchResult = async () => {
      setIsLoading(true);

      const data = await getResultsInRound(round.id);

      console.log(data);

      setResultData(Array.isArray(data) ? null : data as SplittedResult);
      setIsLoading(false);
    }

    fetchResult();
  }, [competitionId, event.id, round.id]);

  const isBlindfolded = event.event === 'E333BF';
  const totalAttempts = isBlindfolded ? 3 : 5;

  const { valued, blank } = useMemo(() => {
      if (!resultData) return { valued: [], blank: [] };

      let flatList: ExtendedResult[] = [];

      if ('valued' in resultData && Array.isArray((resultData as any).valued)) {
        const objResults = resultData as { valued: ExtendedResult[], blank: ExtendedResult[] };
        flatList = [...objResults.valued, ...objResults.blank];
      }
      else if (Array.isArray(resultData))
        flatList = resultData as ExtendedResult[];

      return {
        valued: flatList
          .filter(r => r.result !== null && r.result > 0)
          .sort((a, b) => Number(a.result) - Number(b.result)),

        blank: flatList
          .filter(r => r.result === null || r.result <= 0)
          .sort((a, b) => {
            if (a.result !== null && b.result === null) return -1;
            if (a.result === null && b.result !== null) return 1;
            if (a.result === null && b.result === null) return 0;

            const bestA = (a.best !== null && a.best > 0) ? a.best : Infinity;
            const bestB = (b.best !== null && b.best > 0) ? b.best : Infinity;

            return bestA - bestB;
          })
      };
  }, [resultData]);

  const allResults = useMemo(() => [...valued, ...blank], [valued, blank]);

  const totalParticipants = valued.length + blank.length;
  const totalQuit = valued.filter((result) => result.status === 'DROPOUT').length;
  let proceedingCount = round?.proceed ? 0 : 3;
  if (round?.proceed && Number.isInteger(round?.proceed))
    proceedingCount = round?.proceed + totalQuit;
  else if (round?.proceed)
    proceedingCount = Math.floor(round?.proceed * totalParticipants) + totalQuit;

  return (
    <>
      <div className='mx-auto w-full max-w-5xl px-4 md:px-0 mb-5 text-left'>
        <p className='text-3xl font-bold'>{getTitleString()}</p>
        <p className='text-xl text-default-500 font-medium'>{getProceedingString()}</p>
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label='Results Table'>
            <Table.Header>
              <Table.Column isRowHeader>#</Table.Column>
              <Table.Column>{t('name')}</Table.Column>
              {/* <Table.Column>Region</Table.Column> */}
              <Table.Column>1</Table.Column>
              <Table.Column>2</Table.Column>
              <Table.Column>3</Table.Column>
              {!isBlindfolded ? <Table.Column>4</Table.Column> : <Table.Column className='hidden'>4</Table.Column>}
              {!isBlindfolded ? <Table.Column>5</Table.Column> : <Table.Column className='hidden'>5</Table.Column>}
              {!isBlindfolded ? <Table.Column>{t('average')}</Table.Column> : <Table.Column className='hidden'>Avg</Table.Column>}
              <Table.Column>{t('best')}</Table.Column>
            </Table.Header>
            <Table.Body 
              renderEmptyState={() => (
                <div className='flex flex-col justify-center items-center py-16 px-4 text-center'>
                  {!isLoading && (
                    <>
                      <div className="bg-default-100 rounded-full p-4 mb-4">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-10 h-10 text-default-400"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>
                      </div>
                      <p className='text-lg font-semibold text-foreground'>
                        {t('no_results.header')}
                      </p>
                      <p className='text-sm text-default-500 mt-1 max-w-sm'>
                        {t('no_results.description')}
                      </p>
                    </>
                  )}
                </div>
              )}
            >
              {allResults.map((result, i) => {
                const isValued = result.best !== null;
                let rank = i + 1;
                let isPassing = false;

                if (isValued) {
                  if (i > 0) {
                      const prev = allResults[i - 1];
                      if (prev.result && prev.result === result.result && prev.best === result.best) {
                          rank = prev.rank!;
                      }
                  }
                  result.rank = rank;
                  isPassing = result.best !== null && result.best > 0 && proceedingCount >= rank;
                }

                const cellTextColor = isValued ? '' : 'text-default-400';
                const rankDisplay = isValued ? (
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${isPassing && result.status === 'ACTIVE' ? 'bg-green-200 text-green-800 font-bold' : ''}`}>
                      {rank}
                  </div>
                ) : (
                  <div className='w-8 h-8 flex items-center justify-center text-default-400'>-</div>
                );

                return (
                  <Table.Row key={result.id}>
                    <Table.Cell>{rankDisplay}</Table.Cell>
                    <Table.Cell className={cellTextColor}>{result.competitor.name}</Table.Cell>
                    {/* <Table.Cell className={cellTextColor}>{result.competitor.region}</Table.Cell> */}
                    <Table.Cell className={cellTextColor}>{result.attempts[0] ? numToFormatted(result.attempts[0], true) : ''}</Table.Cell>
                    <Table.Cell className={cellTextColor}>{result.attempts[1] ? numToFormatted(result.attempts[1], true) : ''}</Table.Cell>
                    <Table.Cell className={cellTextColor}>{result.attempts[2] ? numToFormatted(result.attempts[2], true) : ''}</Table.Cell>
                    {!isBlindfolded ? <Table.Cell className={cellTextColor}>{result.attempts[3] === 0 ? '' : numToFormatted(result.attempts[3], true)}</Table.Cell> : <></>}
                    {!isBlindfolded ? <Table.Cell className={cellTextColor}>{result.attempts[4] === 0 ? '' : numToFormatted(result.attempts[4], true)}</Table.Cell> : <></>}
                    {!isBlindfolded ? <Table.Cell className={`font-semibold ${cellTextColor}`}>{result.result ? numToFormatted(result.result) : ''}</Table.Cell> : <></>}
                    <Table.Cell className={cellTextColor}>{result.best ? numToFormatted(result.best) : ''}</Table.Cell>
                  </Table.Row>
                );
            })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </>
  );
}


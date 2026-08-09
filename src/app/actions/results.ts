/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { DatabaseClient } from '../lib/clients/DatabaseClient';
import { ResultRepository } from '../lib/repositories/ResultRepository';
import { ResultService } from '../lib/services/ResultService';

const prisma = DatabaseClient.getInstance();
const resultRepository = new ResultRepository(prisma);
const resultService = new ResultService(resultRepository);

export async function getResultsInRound(roundId: number) {
  try {
    const result = await resultService.getResultsInRound(roundId);

    const valued = result.filter((r: any) => r.result !== null && r.result > 0);
        
    const blank = result.filter((r: any) => r.result === null || r.result <= 0);

    valued.sort((a: any, b: any) => {
      const resA = Number(a.result);
      const resB = Number(b.result);
      if (resA !== resB) return resA - resB;

      const bestA = (a.best !== null) ? Number(a.best) : Infinity;
      const bestB = (b.best !== null) ? Number(b.best) : Infinity;
      if (bestA !== bestB) return bestA - bestB;

      return (a.competitor?.name || "").localeCompare(b.competitor?.name || "");
    });

    blank.sort((a: any, b: any) => {
      return (a.competitor?.name || "").localeCompare(b.competitor?.name || "");
    });

    return { valued, blank };
  }
  catch (error) {
    console.error('Failed to fetch all targetted results in action:', error);
    return [];
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { PredictionForm } from '@/generated/prisma/client';
import { predictionAnswerService, predictionFormService } from '../lib/services/instances';
import { CuberData } from '@/types/predictions/CuberData';
import { AdminPredictionFormDTO, PublicPredictionFormDTO } from '../lib/dtos/AdminPredictionFormDTO';
import { PredictionAnswer, Prisma } from '@/generated/prisma';

async function getAllCubers({ competitionId, isThaiOnly = false }: { competitionId: string, isThaiOnly: boolean }) {
  try {
    const eventIds: string[] = [];

    await fetch(`${process.env.WCA_URL}/api/v0/competitions/${competitionId}/events`, {
      method: 'GET',
    })
    .then(response => {
      if (!response.ok) 
        throw new Error('Competition event fetching response was not ok');

      return response.json();
    })
    .then(data => {
      console.log('Received event data:', data);

      for (const eventData of data)
        eventIds.push(eventData.id);
    })

    const cubersData: Record<string, CuberData[]> = {};

    for (const eventId of eventIds) {
      const response = await fetch(`${process.env.WCA_URL}/api/v0/competitions/${competitionId}/psych-sheet/${eventId}`);

      if (!response.ok)
        throw new Error(`An error occured while fetching ${eventId}'s psych sheet`);

      const eventPsych = await response.json();

      const allRegisteredCubers: CuberData[] = eventPsych.sorted_rankings.map((entry: any) => ({
        name: entry.name,
        wcaId: entry.wca_id,
        countryIso2: entry.country_iso2,
        event: eventId,
        pos: entry.pos,
      }));

      let cubers = allRegisteredCubers;

      if (isThaiOnly)
        cubers = cubers.filter(cuber => cuber.countryIso2 === 'TH');

      cubers.sort((a, b) => {
        // If both don't have a position, keep their current order
        if (a.pos === null && b.pos === null) return 0;
        
        // If only 'a' is missing a position, push 'a' to the bottom
        if (a.pos === null) return 1;
        
        // If only 'b' is missing a position, push 'b' to the bottom
        if (b.pos === null) return -1;
        
        // If both have valid numeric positions, sort ascending normally
        return a.pos - b.pos;
      });

      cubersData[eventId] = cubers;
    }

    return cubersData;
  }
  catch (error) {
    console.error(error);
  }
}

export async function createNewPredictionForm({payload}: {payload: Partial<PredictionForm>}) {
  try {
    if (!payload.id || !payload.name || !payload.openTime || !payload.closeTime)
      return { success: false, error: 'Missing required fields' };

    console.log('Creating form for:', payload.id);

    const allRegisteredCubers: Record<string, CuberData[]> | undefined = await getAllCubers({
      competitionId: payload.id, 
      isThaiOnly: payload.isThaiOnly ?? false
    });

    if (!allRegisteredCubers || Object.keys(allRegisteredCubers).length === 0)
      return { success: false, error: 'No competitors found for this competition.' };

    const createdForm = await predictionFormService.createFormWithCompetitors(payload, allRegisteredCubers);

    return { success: true, formId: createdForm.id };
  } 
  catch (error: any) {
    console.error('Failed to create prediction form:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function getAllPredictionForms() {
  try {
    const data = await predictionFormService.getAll();
    return { success: true, data };
  }
  catch (error: any) {
    console.error('Failed to get all forms')
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function getPredictionFormDataById(id: string, adminMode: true): Promise<{ success: true; data: AdminPredictionFormDTO } | { success: false; error: string }>;
export async function getPredictionFormDataById(id: string, adminMode?: false): Promise<{ success: true; data: PublicPredictionFormDTO } | { success: false; error: string }>;

export async function getPredictionFormDataById(id: string, adminMode: boolean = false) {
  try {
    const data = adminMode 
      ? await predictionFormService.getById(id, true)
      : await predictionFormService.getById(id, false);

    return { success: true, data };
  }
  catch (error: any) {
    console.error('Failed to get forms with an ID of:', id);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function updatePredictionAnswers(predictionFormId: string, answers: Prisma.PredictionAnswerCreateManyInput[]) {
  try {
    await predictionAnswerService.createAnswers({ predictionFormId, answers });

    return { success: true, message: 'Successfully updated answers' };
  }
  catch (error: any) {
    console.error('Failed to update forms answer with an ID of:', predictionFormId);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
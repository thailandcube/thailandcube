'use server';

import { RegisterCompetitorInput } from '../lib/dtos/RegistrationDTO';
import { registrationService } from '../lib/services/instances';

/**
 * Register new competitor to competition
 * @param input RegisterCompetitorInput data
 */
export async function registerNewCompetitor(input: RegisterCompetitorInput) {
  try {
    await registrationService.registerNewCompetitor(input);

    return {success: true, message: 'Competitor registered successfully'};
  }
  catch (error) {
    console.error('Failed to register competitor:', error);
    
    return { 
      success: false, 
      message: error || 'An unexpected error occurred during registration.' 
    };
  }
}
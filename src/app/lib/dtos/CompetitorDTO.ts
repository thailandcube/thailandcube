import { Competitor } from '@/generated/prisma/client';
import { RegistrationWithEventsDTO } from './RegistrationDTO';

export interface CompetitorWithRegistrationsDTO extends Competitor {
  registrations: RegistrationWithEventsDTO[];
}
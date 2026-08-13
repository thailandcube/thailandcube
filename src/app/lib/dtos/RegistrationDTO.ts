/* eslint-disable @typescript-eslint/no-explicit-any */
import { Registration, RegistrationEvent, Event } from '@/generated/prisma/client';

export interface RegistrationRecordDTO {
  competitorId: string;
  id?: string;
  name: string;
  wca_id?: string;
  [key: string]: any;
}

export interface RegisterCompetitorInput {
  payload: RegistrationRecordDTO;
  competitionId: string;
  eventsInComp: Event[];
}

export interface RegistrationWithEventsDTO extends Registration {
  events: RegistrationEvent[];
}
import { DatabaseClient } from '../clients/DatabaseClient';
import { CompetitionRepository } from '../repositories/CompetitionRepository';

import { CompetitorRepository } from '../repositories/CompetitorRepository';
import { EventRepository } from '../repositories/EventRepository';
import { NationalRecordRepository } from '../repositories/NationalRecordRepository';
import { PredictionAnswerRepository } from '../repositories/PredictionAnswerRepository';
import { PredictionFormRepository } from '../repositories/PredictionFormRepository';
import { PredictionSubmissionRepository } from '../repositories/PredictionSubmissionRepository';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { ResultRepository } from '../repositories/ResultRepository';
import { UserRepository } from '../repositories/UserRepository';
import { CompetitionService } from './CompetitionService';

import { CompetitorService } from './CompetitorService';
import { EventService } from './EventService';
import { NationalRecordService } from './NationalRecordService';
import { PredictionAnswerService } from './PredictionAnswerService';
import { PredictionFormService } from './PredictionFormService';
import { PredictionSubmissionService } from './PredictionSubmissionService';
import { RegistrationService } from './RegistrationService';
import { ResultService } from './ResultService';
import { UserService } from './UserService';

const prisma = DatabaseClient.getInstance();

const competitionRepository = new CompetitionRepository(prisma);
const competitorRepository = new CompetitorRepository(prisma);
const eventRepository = new EventRepository(prisma);
const nationalRecordRepository = new NationalRecordRepository(prisma);
const predictionAnswerRepository = new PredictionAnswerRepository(prisma);
const predictionFormRepository = new PredictionFormRepository(prisma);
const predictionSubmissionRepository = new PredictionSubmissionRepository(prisma);
const registrationRepository = new RegistrationRepository(prisma);
const resultRepository = new ResultRepository(prisma);
const userRepository = new UserRepository(prisma);

export const competitionService = new CompetitionService(competitionRepository);
export const competitorService = new CompetitorService(competitorRepository);
export const eventService = new EventService(eventRepository);
export const nationalRecordService = new NationalRecordService(nationalRecordRepository);
export const predictionAnswerService = new PredictionAnswerService(predictionAnswerRepository);
export const predictionFormService = new PredictionFormService(predictionFormRepository);
export const predictionSubmissionService = new PredictionSubmissionService(predictionSubmissionRepository);
export const registrationService = new RegistrationService(registrationRepository);
export const resultService = new ResultService(resultRepository);
export const userService = new UserService(userRepository);
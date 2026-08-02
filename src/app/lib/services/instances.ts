import { DatabaseClient } from '../clients/DatabaseClient';

import { CompetitorRepository } from '../repositories/CompetitorRepository';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { ResultRepository } from '../repositories/ResultRepository';

import { CompetitorService } from './CompetitorService';
import { RegistrationService } from './RegistrationService';
import { ResultService } from './ResultService';

const prisma = DatabaseClient.getInstance();

const competitorRepository = new CompetitorRepository(prisma);
const registrationRepository = new RegistrationRepository(prisma);
const resultRepository = new ResultRepository(prisma);

export const competitorService = new CompetitorService(competitorRepository);
export const registrationService = new RegistrationService(registrationRepository);
export const resultService = new ResultService(resultRepository);
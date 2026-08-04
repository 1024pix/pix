import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import knowledgeElementForParticipationService from '../../../prescription/shared/domain/services/knowledge-element-for-participation-service.js';
import * as answerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as courseRepository from '../../../shared/infrastructure/repositories/course-repository.js';
import * as knowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as smartRandomChallengeRepository from '../../infrastructure/repositories/smart-random-challenge-repository.js';
import * as algorithmDataFetcherService from './algorithm-methods/data-fetcher.js';
import * as smartRandomService from './algorithm-methods/smart-random.js';
import { getCampaignProgression } from './get-campaign-progression.js';
import { getNextChallengeForCampaignAssessment } from './get-next-challenge-for-campaign-assessment.js';
import { getNextChallengeForCompetenceEvaluation } from './get-next-challenge-for-competence-evaluation.js';
import { getNextChallengeForDemo } from './get-next-challenge-for-demo.js';
import * as improvementService from './improvement-service.js';
import { pickChallengeService } from './pick-challenge-service.js';

const dependencies = {
  algorithmDataFetcherService,
  answerRepository,
  campaignParticipationRepository,
  campaignRepository,
  courseRepository,
  improvementService,
  knowledgeElementForParticipationService,
  knowledgeElementRepository,
  pickChallengeService,
  skillRepository,
  smartRandomChallengeRepository,
  smartRandomService,
};

const servicesWithoutInjectedDependencies = {
  getCampaignProgression,
  getNextChallengeForCampaignAssessment,
  getNextChallengeForCompetenceEvaluation,
  getNextChallengeForDemo,
};

export const services = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);

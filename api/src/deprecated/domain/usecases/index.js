import { legalDocumentApiRepository } from '../../../../src/identity-access-management/infrastructure/repositories/legal-document-api.repository.js';
import * as userRepository from '../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import * as membershipRepository from '../../../../src/team/infrastructure/repositories/membership.repository.js';
import * as userRecommendedTrainingRepository from '../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { userOrgaSettingsRepository } from '../../../team/infrastructure/repositories/user-orga-settings-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { prescriberRepository } from '../../infrastructure/repositories/prescriber-repository.js';
import { getCurrentUser } from './get-current-user.js';
import { getPrescriber } from './get-prescriber.js';

const dependencies = {
  userRepository,
  prescriberRepository,
  membershipRepository,
  userOrgaSettingsRepository,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
  legalDocumentApiRepository,
};

const usecasesWithoutInjectedDependencies = {
  getCurrentUser,
  getPrescriber,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };

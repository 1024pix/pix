import { USER_ID_ADMIN_ORGANIZATION } from '../common/constants.js';
import { createAssessmentCampaign } from '../common/tooling/campaign-tooling.js';
import { PIX_EDU_SMALL_TARGET_PROFILE_ID, TEAM_DEVCOMP_ORGANIZATION_ID } from './constants.js';

async function _createScoCampaigns(databaseBuilder, trainingIds, participantCount) {
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_DEVCOMP_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'PIX+ EDU - SCO - envoi simple',
    code: 'EDUSIMPLE',
    externalIdLabel: 'IdPixLabel',
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: {
      participantCount,
      completionDistribution: { started: participantCount },
      profileDistribution: { beginner: 1, perfect: 1, blank: 1 },
      recommendedTrainingsIds: trainingIds,
    },
  });
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_DEVCOMP_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'PIX+ EDU - SCO- envoi multiple',
    code: 'EDUMULTIP',
    externalIdLabel: 'IdPixLabel',
    multipleSendings: true,
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: {
      participantCount,
      completionDistribution: { shared: participantCount },
      profileDistribution: { beginner: 1, perfect: 1, blank: 1 },
      recommendedTrainingsIds: trainingIds,
    },
    recommendationEngine: true,
    // trainingIds[9] is frFrTrainingId2 (DEVCOMP_BASE_TRAINING_ID + 9), built by buildTrainings.
    highlightedTrainingIds: [trainingIds[9]],
  });
}

export function buildCampaigns(databaseBuilder, trainingIds, participantCount) {
  return _createScoCampaigns(databaseBuilder, trainingIds, participantCount);
}

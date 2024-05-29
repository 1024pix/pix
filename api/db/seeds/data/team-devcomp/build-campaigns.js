import { SCO_ORGANIZATION_ID, USER_ID_ADMIN_ORGANIZATION } from '../common/constants.js';
import { createAssessmentCampaign } from '../common/tooling/campaign-tooling.js';
import { PIX_EDU_SMALL_TARGET_PROFILE_ID } from './constants.js';

async function _createScoCampaigns(databaseBuilder, trainingIds) {
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'PIX+ EDU - SCO - envoi simple',
    code: 'EDUSIMPLE',
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: {
      participantCount: 3,
      profileDistribution: { beginner: 1, perfect: 1, blank: 1 },
      recommendedTrainingsIds: trainingIds,
    },
  });
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'PIX+ EDU - SCO- envoi multiple',
    code: 'EDUMULTIP',
    multipleSendings: true,
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: {
      participantCount: 3,
      profileDistribution: { beginner: 1, perfect: 1, blank: 1 },
      recommendedTrainingsIds: trainingIds,
    },
  });
}

export function buildCampaigns(databaseBuilder, trainingIds) {
  return _createScoCampaigns(databaseBuilder, trainingIds);
}

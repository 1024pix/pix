import { PIX_EDU_SMALL_TARGET_PROFILE_ID } from './constants.js';
import { SCO_ORGANIZATION_ID, SCO_ORGANIZATION_USER_ID } from '../common/constants.js';
import { createAssessmentCampaign } from '../common/tooling/campaign-tooling.js';

async function _createScoCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'PIX+ EDU - SCO - envoi simple',
    code: 'EDUSIMPLE',
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'PIX+ EDU - SCO- envoi multiple',
    code: 'EDUMULTIP',
    multipleSendings: true,
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });
}

export function buildCampaigns(databaseBuilder) {
  return _createScoCampaigns(databaseBuilder);
}

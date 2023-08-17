import { createAssessmentCampaign, createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import { PIX_EDU_SMALL_TARGET_PROFILE_ID, SCO_ORGANIZATION_ID, SCO_ORGANIZATION_USER_ID } from './constants.js';

async function _createScoCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: "Campagne d'évaluation SCO - envoi simple",
    code: 'SCOSIMPLE',
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: { participantCount: 0 },
  });
  await createAssessmentCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: "Campagne d'évaluation SCO - envoi multiple",
    code: 'SCOMULTIP',
    multipleSendings: true,
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    configCampaign: { participantCount: 0 },
  });
  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SCO - envoi simple',
    type: 'PROFILES_COLLECTION',
    code: 'COLLECSIM',
    title: null,
    configCampaign: { participantCount: 0, profileDistribution: {} },
  });
  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SCO - envoi multiple',
    type: 'PROFILES_COLLECTION',
    code: 'COLLECMUL',
    title: null,
    multipleSendings: true,
    configCampaign: { participantCount: 0, profileDistribution: {} },
  });
}

export function buildCampaigns(databaseBuilder) {
  return _createScoCampaigns(databaseBuilder);
}

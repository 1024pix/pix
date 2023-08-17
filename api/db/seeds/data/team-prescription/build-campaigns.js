import { createAssessmentCampaign, createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import { SCO_ORGANIZATION_ID, SCO_ORGANIZATION_USER_ID, TARGET_PROFILE_ID } from './constants.js';

async function _createScoCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_ID,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: "Campagne d'évaluation SCO",
    configCampaign: { participantCount: 5 },
  });

  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SCO - envoi simple',
    type: 'PROFILES_COLLECTION',
    title: null,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });

  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SCO - envoi multiple',
    type: 'PROFILES_COLLECTION',
    title: null,
    multipleSendings: true,
    sharedAt: new Date('2022-05-18'),
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1 } },
  });
}

export async function buildCampaigns(databaseBuilder) {
  return _createScoCampaigns(databaseBuilder);
}

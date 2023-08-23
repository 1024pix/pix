import {
  SCO_ORGANIZATION_ID,
  SCO_ORGANIZATION_USER_ID,
  SUP_ORGANIZATION_ID,
  SUP_ORGANIZATION_USER_ID,
  PRO_ORGANIZATION_ID,
  PRO_ORGANIZATION_USER_ID,
  TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
  TARGET_PROFILE_BADGES_STAGES_ID,
} from './constants.js';
import { createProfilesCollectionCampaign, createAssessmentCampaign } from '../common/tooling/campaign-tooling.js';
import dayjs from 'dayjs';

async function _createScoCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: "Campagne d'évaluation SCO",
    createdAt: dayjs().subtract(30, 'days').toDate(),
    configCampaign: {
      participantCount: 10,
      completionDistribution: {
        started: 1,
        to_share: 2,
        shared_one_validated_skill: 1,
        shared_perfect: 1,
      },
    },
  });

  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SCO',
    multipleSendings: true,
    type: 'PROFILES_COLLECTION',
    title: null,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });
}

async function _createSupCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    organizationId: SUP_ORGANIZATION_ID,
    ownerId: SUP_ORGANIZATION_USER_ID,
    name: "Campagne d'évaluation SUP",
    createdAt: dayjs().subtract(30, 'days').toDate(),
    configCampaign: {
      participantCount: 10,
      completionDistribution: {
        started: 1,
        to_share: 2,
        shared_one_validated_skill: 1,
        shared_perfect: 1,
      },
    },
  });

  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: SUP_ORGANIZATION_ID,
    ownerId: SUP_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SUP',
    multipleSendings: true,
    type: 'PROFILES_COLLECTION',
    title: null,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });
}

async function _createProCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: PRO_ORGANIZATION_USER_ID,
    name: "Campagne d'évaluation PRO",
    createdAt: dayjs().subtract(30, 'days').toDate(),
    configCampaign: {
      participantCount: 10,
      completionDistribution: {
        started: 1,
        to_share: 2,
        shared_one_validated_skill: 1,
        shared_perfect: 1,
      },
    },
  });

  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: PRO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil PRO',
    multipleSendings: true,
    type: 'PROFILES_COLLECTION',
    title: null,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });
}

export async function buildCampaigns(databaseBuilder) {
  await _createProCampaigns(databaseBuilder);
  await _createSupCampaigns(databaseBuilder);
  return _createScoCampaigns(databaseBuilder);
}

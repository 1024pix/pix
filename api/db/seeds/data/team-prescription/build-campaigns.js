import dayjs from 'dayjs';

import {
  PRO_MANAGING_ORGANIZATION_ID,
  PRO_ORGANIZATION_ID,
  SCO_MANAGING_ORGANIZATION_ID,
  SUP_MANAGING_ORGANIZATION_ID,
  USER_ID_ADMIN_ORGANIZATION,
} from '../common/constants.js';
import { createAssessmentCampaign, createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import {
  CAMPAIGN_PROASSMUL_ID,
  TARGET_PROFILE_BADGES_STAGES_ID,
  TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
} from './constants.js';

async function _createScoCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation SCO",
    code: 'SCOASSIMP',
    idPixLabel: 'IdPixLabel',
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

  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation SCO envoi multiple",
    code: 'SCOASSMUL',
    idPixLabel: 'IdPixLabel',
    multipleSendings: true,
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
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'Campagne de collecte de profil SCO',
    multipleSendings: true,
    type: 'PROFILES_COLLECTION',
    code: 'SCOCOLMUL',
    idPixLabel: 'IdPixLabel',
    title: null,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });
}

async function _createSupCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation SUP",
    code: 'SUPASSIMP',
    idPixLabel: 'IdPixLabel',
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

  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation SUP envoi multiple",
    code: 'SUPASSMUL',
    idPixLabel: 'IdPixLabel',
    multipleSendings: true,
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
    organizationId: SUP_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'Campagne de collecte de profil SUP',
    code: 'SUPCOLMUL',
    idPixLabel: 'IdPixLabel',
    multipleSendings: true,
    type: 'PROFILES_COLLECTION',
    title: null,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });
}

async function _createProGenericCampaigns(databaseBuilder) {
  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: PRO_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'Campagne de collecte de profil PRO',
    multipleSendings: true,
    code: 'PROGENCOL',
    idPixLabel: 'IdPixLabel',
    type: 'PROFILES_COLLECTION',
    title: null,
  });
}

async function _createProCampaigns(databaseBuilder) {
  await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'Campagne de collecte de profil PRO',
    idPixLabel: 'IdPixLabel',
    multipleSendings: true,
    code: 'PROCOLMUL',
    type: 'PROFILES_COLLECTION',
    title: null,
    configCampaign: { participantCount: 3, profileDistribution: { beginner: 1, perfect: 1, blank: 1 } },
  });

  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    isForAbsoluteNovice: true,
    name: "Campagne d'évaluation PRO",
    idPixLabel: 'IdPixLabel',
    code: 'PROASSIMP',
    createdAt: dayjs().subtract(30, 'days').toDate(),
    configCampaign: {
      participantCount: 10,
      completionDistribution: {
        started: 1,
        to_share: 2,
        shared_one_validated_skill: 1,
        shared_perfect: 1,
      },
      anonymousParticipation: true,
    },
  });

  await createAssessmentCampaign({
    campaignId: CAMPAIGN_PROASSMUL_ID,
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO envoi multiple",
    code: 'PROASSMUL',
    idPixLabel: 'IdPixLabel',
    multipleSendings: true,
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
}

export async function buildCampaigns(databaseBuilder) {
  await _createProCampaigns(databaseBuilder);
  await _createSupCampaigns(databaseBuilder);
  await _createProGenericCampaigns(databaseBuilder);
  return _createScoCampaigns(databaseBuilder);
}

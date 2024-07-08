import dayjs from 'dayjs';

import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import {
  PRO_MANAGING_ORGANIZATION_ID,
  PRO_ORGANIZATION_ID,
  SCO_MANAGING_ORGANIZATION_ID,
  SUP_MANAGING_ORGANIZATION_ID,
  USER_ID_ADMIN_ORGANIZATION,
} from '../common/constants.js';
import { createAssessmentCampaign, createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import { TARGET_PROFILE_BADGES_STAGES_ID, TARGET_PROFILE_NO_BADGES_NO_STAGES_ID } from './constants.js';

async function _createScoCampaigns(databaseBuilder) {
  await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
    organizationId: SCO_MANAGING_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation SCO",
    code: 'SCOASSIMP',
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
    name: "Campagne d'évaluation PRO",
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
    },
  });

  const { campaignId } = await createAssessmentCampaign({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO envoi multiple",
    code: 'PROASSMUL',
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

  const { id: userId } = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Alex',
    lastName: 'Terieur',
    email: 'alex-terieur@example.net',
    cgu: true,
    lang: 'fr',
  });

  const { id: organizationLearnerId } = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Alex',
    lastName: 'Terieur',
    userId,
    organizationId: PRO_ORGANIZATION_ID,
  });
  const { id: firstCampaignParticipationId, createdAt } = await databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    organizationLearnerId,
    userId,
    isImproved: true,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });
  await databaseBuilder.factory.buildAssessment({
    userId,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: firstCampaignParticipationId,
  });

  const { id: secondCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId,
    userId,
    campaignId,
    isImproved: true,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: secondCampaignParticipationId,
  });

  const { id: thirdCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId,
    userId,
    campaignId,
    isImproved: false,
    status: CampaignParticipationStatuses.TO_SHARE,
    sharedAt: null,
    createdAt: '2024-06-01T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: thirdCampaignParticipationId,
  });
}

export async function buildCampaigns(databaseBuilder) {
  await _createProCampaigns(databaseBuilder);
  await _createSupCampaigns(databaseBuilder);
  await _createProGenericCampaigns(databaseBuilder);
  return _createScoCampaigns(databaseBuilder);
}

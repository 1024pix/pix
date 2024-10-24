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
    multipleSendings: true,
    code: 'PROCOLMUL',
    idPixLabel: 'IdPixLabel',
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
    code: 'PROASSIMP',
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
      anonymousParticipation: true,
    },
  });

  const { campaignId } = await createAssessmentCampaign({
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

  const user1 = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Alex',
    lastName: 'Terieur',
    email: 'alex-terieur@example.net',
    cgu: true,
    lang: 'fr',
  });

  const organizationLearner1 = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Alex',
    lastName: 'Terieur',
    userId: user1.id,
    organizationId: PRO_ORGANIZATION_ID,
  });
  const { id: user1FirstCampaignParticipationId, createdAt } = await databaseBuilder.factory.buildCampaignParticipation(
    {
      campaignId,
      organizationLearnerId: organizationLearner1.id,
      userId: user1.id,
      masteryRate: 0.1,
      isImproved: true,
      createdAt: '2023-12-27T15:07:57.376Z',
      sharedAt: '2024-01-04T15:07:57.376Z',
    },
  );
  await databaseBuilder.factory.buildAssessment({
    userId: user1.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: user1FirstCampaignParticipationId,
  });

  const { id: user1SecondCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: organizationLearner1.id,
    userId: user1.id,
    campaignId,
    masteryRate: 0.3,
    isImproved: true,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: user1.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: user1SecondCampaignParticipationId,
  });

  const { id: user1ThirdCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: organizationLearner1.id,
    userId: user1.id,
    campaignId,
    isImproved: false,
    status: CampaignParticipationStatuses.TO_SHARE,
    sharedAt: null,
    createdAt: '2024-06-01T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: user1.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: user1ThirdCampaignParticipationId,
  });

  const user2 = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Jean-Philippe',
    lastName: 'Errvitemonslip',
    email: 'jean-philippe-errvitemonslip@example.net',
    cgu: true,
    lang: 'fr',
  });

  const organizationLearner2 = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Jean-Philippe',
    lastName: 'Errvitemonslip',
    userId: user2.id,
    organizationId: PRO_ORGANIZATION_ID,
  });
  const { id: user2FirstCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    organizationLearnerId: organizationLearner2.id,
    userId: user2.id,
    masteryRate: 0.5,
    isImproved: true,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });
  await databaseBuilder.factory.buildAssessment({
    userId: user2.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: user2FirstCampaignParticipationId,
  });

  const { id: user2SecondCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: organizationLearner2.id,
    userId: user2.id,
    campaignId,
    masteryRate: 0.1,
    isImproved: true,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: user2.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: user2SecondCampaignParticipationId,
  });

  const user3 = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Sarah',
    lastName: 'Croche',
    email: 'sarah-croche@example.net',
    cgu: true,
    lang: 'fr',
  });

  const organizationLearner3 = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Sarah',
    lastName: 'Croche',
    userId: user3.id,
    organizationId: PRO_ORGANIZATION_ID,
  });
  const { id: user3FirstCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    organizationLearnerId: organizationLearner3.id,
    userId: user3.id,
    masteryRate: 0.5,
    isImproved: true,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });
  await databaseBuilder.factory.buildAssessment({
    userId: user3.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: user3FirstCampaignParticipationId,
  });

  const { id: user3SecondCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: organizationLearner3.id,
    userId: user3.id,
    campaignId,
    masteryRate: 0.5,
    isImproved: true,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: user3.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: user3SecondCampaignParticipationId,
  });
}

export async function buildCampaigns(databaseBuilder) {
  await _createProCampaigns(databaseBuilder);
  await _createSupCampaigns(databaseBuilder);
  await _createProGenericCampaigns(databaseBuilder);
  return _createScoCampaigns(databaseBuilder);
}

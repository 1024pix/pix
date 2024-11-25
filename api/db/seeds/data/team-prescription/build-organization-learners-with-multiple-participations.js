import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { PRO_ORGANIZATION_ID } from '../common/constants.js';
import { CAMPAIGN_PROASSMUL_ID, CAMPAIGN_PROCOLMUL_ID } from './constants.js';

async function _buildMultipleParticipationsForPROASSMULCampaign(databaseBuilder) {
  const firstUser = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Alex',
    lastName: 'Terieur',
    email: 'alex-terieur@example.net',
    cgu: true,
    lang: 'fr',
  });

  const firstOrganizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Alex',
    lastName: 'Terieur',
    userId: firstUser.id,
    organizationId: PRO_ORGANIZATION_ID,
  });

  const { id: firstUserFirstCampaignParticipationId, createdAt } =
    await databaseBuilder.factory.buildCampaignParticipation({
      campaignId: CAMPAIGN_PROASSMUL_ID,
      organizationLearnerId: firstOrganizationLearner.id,
      userId: firstUser.id,
      masteryRate: 0.1,
      isImproved: true,
      createdAt: '2023-12-27T15:07:57.376Z',
      sharedAt: '2024-01-04T15:07:57.376Z',
    });

  await databaseBuilder.factory.buildAssessment({
    userId: firstUser.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: firstUserFirstCampaignParticipationId,
  });

  const { id: firstUserSecondCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: firstOrganizationLearner.id,
    userId: firstUser.id,
    campaignId: CAMPAIGN_PROASSMUL_ID,
    masteryRate: 0.3,
    isImproved: true,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: firstUser.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: firstUserSecondCampaignParticipationId,
  });

  const { id: firstUserThirdCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: firstOrganizationLearner.id,
    userId: firstUser.id,
    campaignId: CAMPAIGN_PROASSMUL_ID,
    isImproved: false,
    status: CampaignParticipationStatuses.TO_SHARE,
    sharedAt: null,
    createdAt: '2024-06-01T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: firstUser.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: firstUserThirdCampaignParticipationId,
  });

  const secondUser = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Tata',
    lastName: 'Yoyo',
    email: 'tata-yoyo@example.net',
    cgu: true,
    lang: 'fr',
  });

  const secondOrganizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Tata',
    lastName: 'Yoyo',
    userId: secondUser.id,
    organizationId: PRO_ORGANIZATION_ID,
  });
  const { id: secondUserFirstCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    campaignId: CAMPAIGN_PROASSMUL_ID,
    organizationLearnerId: secondOrganizationLearner.id,
    userId: secondUser.id,
    masteryRate: 0.5,
    isImproved: true,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });
  await databaseBuilder.factory.buildAssessment({
    userId: secondUser.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: secondUserFirstCampaignParticipationId,
  });

  const { id: secondUserSecondCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: secondOrganizationLearner.id,
    userId: secondUser.id,
    campaignId: CAMPAIGN_PROASSMUL_ID,
    masteryRate: 0.1,
    isImproved: true,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: secondUser.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: secondUserSecondCampaignParticipationId,
  });

  const thirdUser = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Sarah',
    lastName: 'Croche',
    email: 'sarah-croche@example.net',
    cgu: true,
    lang: 'fr',
  });

  const thirdOrganizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Sarah',
    lastName: 'Croche',
    userId: thirdUser.id,
    organizationId: PRO_ORGANIZATION_ID,
  });
  const { id: thirdUserFirstCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    campaignId: CAMPAIGN_PROASSMUL_ID,
    organizationLearnerId: thirdOrganizationLearner.id,
    userId: thirdUser.id,
    masteryRate: 0.5,
    isImproved: true,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });
  await databaseBuilder.factory.buildAssessment({
    userId: thirdUser.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: thirdUserFirstCampaignParticipationId,
  });

  const { id: thirdUserSecondCampaignParticipationId } = await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: thirdOrganizationLearner.id,
    userId: thirdUser.id,
    campaignId: CAMPAIGN_PROASSMUL_ID,
    masteryRate: 0.5,
    isImproved: true,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildAssessment({
    userId: thirdUser.id,
    type: Assessment.types.CAMPAIGN,
    createdAt,
    state: Assessment.states.COMPLETED,
    isImproving: true,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId: thirdUserSecondCampaignParticipationId,
  });
}

async function _buildMultipleParticipationsForPROCOLMULCampaign(databaseBuilder) {
  const firstUser = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Martin',
    lastName: 'Sapin',
    email: 'martin-sapin@example.net',
    cgu: true,
    lang: 'fr',
  });

  const firstOrganizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Martin',
    lastName: 'Sapin',
    userId: firstUser.id,
    organizationId: PRO_ORGANIZATION_ID,
  });

  await databaseBuilder.factory.buildCampaignParticipation({
    campaignId: CAMPAIGN_PROCOLMUL_ID,
    organizationLearnerId: firstOrganizationLearner.id,
    userId: firstUser.id,
    pixScore: 20,
    isImproved: true,
    status: CampaignParticipationStatuses.SHARED,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: firstOrganizationLearner.id,
    userId: firstUser.id,
    campaignId: CAMPAIGN_PROCOLMUL_ID,
    pixScore: 50,
    isImproved: false,
    status: CampaignParticipationStatuses.SHARED,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  const secondUser = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'José',
    lastName: 'Lopez',
    email: 'jose-lopez@example.net',
    cgu: true,
    lang: 'fr',
  });

  const secondOrganizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'José',
    lastName: 'Lopez',
    userId: secondUser.id,
    organizationId: PRO_ORGANIZATION_ID,
  });

  await databaseBuilder.factory.buildCampaignParticipation({
    campaignId: CAMPAIGN_PROCOLMUL_ID,
    organizationLearnerId: secondOrganizationLearner.id,
    userId: secondUser.id,
    pixScore: 50,
    isImproved: true,
    status: CampaignParticipationStatuses.SHARED,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: secondOrganizationLearner.id,
    userId: secondUser.id,
    campaignId: CAMPAIGN_PROCOLMUL_ID,
    pixScore: 45,
    isImproved: false,
    status: CampaignParticipationStatuses.SHARED,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });

  const thirdUser = await databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Pierre',
    lastName: 'Quiroule',
    email: 'pierre-quiroule@example.net',
    cgu: true,
    lang: 'fr',
  });

  const thirdOrganizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Pierre',
    lastName: 'Quiroule',
    userId: thirdUser.id,
    organizationId: PRO_ORGANIZATION_ID,
  });

  await databaseBuilder.factory.buildCampaignParticipation({
    campaignId: CAMPAIGN_PROCOLMUL_ID,
    organizationLearnerId: thirdOrganizationLearner.id,
    userId: thirdUser.id,
    pixScore: 20,
    isImproved: true,
    status: CampaignParticipationStatuses.SHARED,
    createdAt: '2023-12-27T15:07:57.376Z',
    sharedAt: '2024-01-04T15:07:57.376Z',
  });

  await databaseBuilder.factory.buildCampaignParticipation({
    organizationLearnerId: thirdOrganizationLearner.id,
    userId: thirdUser.id,
    campaignId: CAMPAIGN_PROCOLMUL_ID,
    pixScore: 20,
    isImproved: false,
    status: CampaignParticipationStatuses.SHARED,
    createdAt: '2024-03-12T15:07:57.376Z',
    sharedAt: '2024-03-24T15:07:57.376Z',
  });
}

export async function buildOrganizationLearnersWithMultipleParticipations(databaseBuilder) {
  await _buildMultipleParticipationsForPROASSMULCampaign(databaseBuilder);
  await _buildMultipleParticipationsForPROCOLMULCampaign(databaseBuilder);
}

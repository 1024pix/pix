import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.ts';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { PRO_ORGANIZATION_ID } from '../common/constants.js';
import { CAMPAIGN_PROASSMUL_ID, CAMPAIGN_PROCOLMUL_ID } from './constants.js';

const PROASSMUL_USERS = [
  {
    firstName: 'Alex',
    lastName: 'Terieur',
    email: 'alex-terieur@example.net',
    participations: [
      {
        masteryRate: 0.1,
        isImproved: true,
        createdAt: '2023-12-27T15:07:57.376Z',
        sharedAt: '2024-01-04T15:07:57.376Z',
      },
      {
        masteryRate: 0.3,
        isImproved: true,
        createdAt: '2024-03-12T15:07:57.376Z',
        sharedAt: '2024-03-24T15:07:57.376Z',
      },
      {
        isImproved: false,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: '2024-06-01T15:07:57.376Z',
        sharedAt: '2024-06-10T15:07:57.376Z',
      },
    ],
  },
  {
    firstName: 'Tata',
    lastName: 'Yoyo',
    email: 'tata-yoyo@example.net',
    participations: [
      {
        masteryRate: 0.5,
        isImproved: true,
        createdAt: '2023-12-27T15:07:57.376Z',
        sharedAt: '2024-01-04T15:07:57.376Z',
      },
      {
        masteryRate: 0.1,
        isImproved: false,
        createdAt: '2024-03-12T15:07:57.376Z',
        sharedAt: '2024-03-24T15:07:57.376Z',
      },
    ],
  },
  {
    firstName: 'Sarah',
    lastName: 'Croche',
    email: 'sarah-croche@example.net',
    participations: [
      {
        masteryRate: 0.5,
        isImproved: true,
        createdAt: '2023-12-27T15:07:57.376Z',
        sharedAt: '2024-01-04T15:07:57.376Z',
      },
      {
        masteryRate: 0.5,
        isImproved: false,
        createdAt: '2024-03-12T15:07:57.376Z',
        sharedAt: '2024-03-24T15:07:57.376Z',
      },
    ],
  },
];

const PROCOLMUL_USERS = [
  {
    firstName: 'Martin',
    lastName: 'Sapin',
    email: 'martin-sapin@example.net',
    participations: [
      { pixScore: 20, isImproved: true, createdAt: '2023-12-27T15:07:57.376Z', sharedAt: '2024-01-04T15:07:57.376Z' },
      { pixScore: 50, isImproved: false, createdAt: '2024-03-12T15:07:57.376Z', sharedAt: '2024-03-24T15:07:57.376Z' },
    ],
  },
  {
    firstName: 'José',
    lastName: 'Lopez',
    email: 'jose-lopez@example.net',
    participations: [
      { pixScore: 50, isImproved: true, createdAt: '2023-12-27T15:07:57.376Z', sharedAt: '2024-01-04T15:07:57.376Z' },
      { pixScore: 45, isImproved: false, createdAt: '2024-03-12T15:07:57.376Z', sharedAt: '2024-03-24T15:07:57.376Z' },
    ],
  },
  {
    firstName: 'Pierre',
    lastName: 'Quiroule',
    email: 'pierre-quiroule@example.net',
    participations: [
      { pixScore: 20, isImproved: true, createdAt: '2023-12-27T15:07:57.376Z', sharedAt: '2024-01-04T15:07:57.376Z' },
      { pixScore: 20, isImproved: false, createdAt: '2024-03-12T15:07:57.376Z', sharedAt: '2024-03-24T15:07:57.376Z' },
    ],
  },
];

async function _buildMultipleParticipationsForPROASSMULCampaign(databaseBuilder) {
  for (const { firstName, lastName, email, participations } of PROASSMUL_USERS) {
    const user = await databaseBuilder.factory.buildUser.withRawPassword({
      firstName,
      lastName,
      email,
      cgu: true,
      lang: 'fr',
    });
    const organizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
      firstName,
      lastName,
      userId: user.id,
      organizationId: PRO_ORGANIZATION_ID,
      division: null,
    });

    for (const participation of participations) {
      const { id: campaignParticipationId, createdAt } = await databaseBuilder.factory.buildCampaignParticipation({
        campaignId: CAMPAIGN_PROASSMUL_ID,
        organizationLearnerId: organizationLearner.id,
        userId: user.id,
        ...participation,
      });

      await databaseBuilder.factory.buildAssessment({
        userId: user.id,
        type: Assessment.types.CAMPAIGN,
        createdAt,
        state: Assessment.states.COMPLETED,
        isImproving: false,
        lastQuestionDate: new Date(),
        lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
        competenceId: null,
        campaignParticipationId,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({ campaignParticipationId, userId: user.id });
    }
  }
}

async function _buildMultipleParticipationsForPROCOLMULCampaign(databaseBuilder) {
  for (const { firstName, lastName, email, participations } of PROCOLMUL_USERS) {
    const user = await databaseBuilder.factory.buildUser.withRawPassword({
      firstName,
      lastName,
      email,
      cgu: true,
      lang: 'fr',
    });
    const organizationLearner = await databaseBuilder.factory.buildOrganizationLearner({
      firstName,
      lastName,
      userId: user.id,
      organizationId: PRO_ORGANIZATION_ID,
      division: null,
    });

    for (const participation of participations) {
      await databaseBuilder.factory.buildCampaignParticipation({
        campaignId: CAMPAIGN_PROCOLMUL_ID,
        organizationLearnerId: organizationLearner.id,
        userId: user.id,
        status: CampaignParticipationStatuses.SHARED,
        ...participation,
      });
    }
  }
}

export async function buildOrganizationLearnersWithMultipleParticipations(databaseBuilder) {
  await _buildMultipleParticipationsForPROASSMULCampaign(databaseBuilder);
  await _buildMultipleParticipationsForPROCOLMULCampaign(databaseBuilder);
}

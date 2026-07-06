import { faker } from '@faker-js/faker';

import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { SCO_MANAGING_ORGANIZATION_ID } from '../../common/constants.js';
import { CAMPAIGN_SCO_COMBINED_COURSE_ID, SIXTH_GRADE_REWARD_ID } from '../constants.js';

export const SCO_SIECLE_COMBINED_COURSE = {
  organizationId: SCO_MANAGING_ORGANIZATION_ID,
  blueprint: {
    name: 'Parcours combine sco SIECLE',
    internalName: 'Parcours combine sco SIECLE',
    rewardId: SIXTH_GRADE_REWARD_ID,
    rewardType: REWARD_TYPES.ATTESTATION,
    requirements: [
      { type: 'evaluation' },
      { type: 'module', moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a' },
      { type: 'module', moduleId: 'f32a2238-4f65-4698-b486-15d51935d335' },
    ],
    rewardRequirementsDescription: 'description des pré-requis',
  },
  combinedCourse: {
    code: 'SCOMBINIX',
  },
  targetProfile: {
    description: 'Description',
    name: 'Parcours',
    tubes: [
      {
        id: 'tube2e715GxaaWzNK6',
        level: 2,
      },
    ],
    campaign: {
      id: CAMPAIGN_SCO_COMBINED_COURSE_ID,
      name: 'Je teste mes compétences',
      code: 'SCOCAMPIX',
      customResultPageButtonText: 'Continuer',
      customResultPageButtonUrl: '/parcours/SCOMBINIX',
      skills: [],
    },
  },
  participations: [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.exampleEmail(),
      division: '6ème',
      group: null,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      campaignStatus: CampaignParticipationStatuses.SHARED,
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.exampleEmail(),
      division: '6ème',
      group: null,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      campaignStatus: CampaignParticipationStatuses.SHARED,
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.exampleEmail(),
      division: '5ème',
      group: null,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      campaignStatus: CampaignParticipationStatuses.SHARED,
    },
  ],
};

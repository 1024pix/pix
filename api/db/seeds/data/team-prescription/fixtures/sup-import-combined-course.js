import { faker } from '@faker-js/faker';

import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { SUP_MANAGING_ORGANIZATION_ID } from '../../common/constants.js';
import { CAMPAIGN_SUP_COMBINED_COURSE_ID } from '../constants.js';
export const SUP_IMPORT_COMBINED_COURSE = {
  organizationId: SUP_MANAGING_ORGANIZATION_ID,
  blueprint: {
    name: 'Parcours combine SUP import',
    internalName: 'Parcours combine SUP import',
    requirements: [
      { type: 'evaluation' },
      { type: 'module', moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a' },
      { type: 'module', moduleId: 'f32a2238-4f65-4698-b486-15d51935d335' },
    ],
  },
  combinedCourse: {
    code: 'SUPINIX',
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
      id: CAMPAIGN_SUP_COMBINED_COURSE_ID,
      name: 'Je teste mes compétences',
      code: 'SUPCAMPIX',
      customResultPageButtonText: 'Continuer',
      customResultPageButtonUrl: '/parcours/SUPINIX',
      skills: [],
    },
  },
  participations: [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.exampleEmail(),
      division: null,
      group: 'Groupe A',
      status: OrganizationLearnerParticipationStatuses.STARTED,
      campaignStatus: CampaignParticipationStatuses.SHARED,
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.exampleEmail(),
      division: null,
      group: 'Groupe A',
      status: OrganizationLearnerParticipationStatuses.STARTED,
      campaignStatus: CampaignParticipationStatuses.SHARED,
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.exampleEmail(),
      division: null,
      group: 'Groupe B',
      status: OrganizationLearnerParticipationStatuses.STARTED,
      campaignStatus: CampaignParticipationStatuses.SHARED,
    },
  ],
};

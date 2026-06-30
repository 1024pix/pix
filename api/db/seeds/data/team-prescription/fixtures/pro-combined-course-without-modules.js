import { faker } from '@faker-js/faker';

import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { PRO_ORGANIZATION_ID } from '../../common/constants.js';
import { CAMPAIGN_PRO_COMBINED_NO_MOD_COURSE_ID } from '../constants.js';

export const COMBINED_COURSE_WITHOUT_MODULES = {
  organizationId: PRO_ORGANIZATION_ID,
  blueprint: {
    name: 'Parcours sans modules',
    internalName: 'Parcours sans modules',
    requirements: [{ type: 'evaluation' }],
  },
  combinedCourse: {
    code: 'CBNOMOD',
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
      id: CAMPAIGN_PRO_COMBINED_NO_MOD_COURSE_ID,
      name: 'Je teste mes compétences',
      code: 'CODEX1',
      customResultPageButtonText: 'Continuer',
      customResultPageButtonUrl: '/parcours/CBNOMOD',
      skills: [],
    },
  },
  participations: [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.exampleEmail(),
      status: OrganizationLearnerParticipationStatuses.STARTED,
    },
  ],
};

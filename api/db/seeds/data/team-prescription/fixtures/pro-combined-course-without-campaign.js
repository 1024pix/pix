import { faker } from '@faker-js/faker';

import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { PRO_ORGANIZATION_ID } from '../../common/constants.js';

export const COMBINED_COURSE_WITHOUT_CAMPAIGN = {
  organizationId: PRO_ORGANIZATION_ID,
  blueprint: {
    name: 'Combinix sans campagne',
    internalName: 'Combinix sans campagne',
    requirements: [{ type: 'module', moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a' }],
  },
  combinedCourse: {
    code: 'CBNOCAMP',
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

import {
  FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
  FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  USER_ID_ADMIN_ORGANIZATION,
  USER_ID_MEMBER_ORGANIZATION,
} from '../common/constants.js';
import { organization } from '../common/tooling/index.js';
import { TEAM_DEVCOMP_ORGANIZATION_ID } from './constants.js';

export async function createDevcompOrganization(databaseBuilder) {
  await organization.createOrganization({
    databaseBuilder,
    organizationId: TEAM_DEVCOMP_ORGANIZATION_ID,
    type: 'SCO',
    name: 'DevComp',
    isManagingStudents: true,
    externalId: 'SCO_DEVCOMP',
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    features: [
      { id: FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID },
      { id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID },
    ],
  });
}

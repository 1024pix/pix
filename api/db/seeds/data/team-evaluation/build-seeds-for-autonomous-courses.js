import { TEAM_EVALUATION_OFFSET_ID } from './constants.js';
import { createTargetProfile } from '../common/tooling/target-profile-tooling.js';
import { organization } from '../common/tooling/index.js';
import { REAL_PIX_SUPER_ADMIN_ID } from '../common/common-builder.js';
import {
  ALL_ORGANIZATION_USER_ID,
  FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
  SCO_ORGANIZATION_USER_ID,
} from '../common/constants.js';

export default async function createSeedsForAutonomousCourse(databaseBuilder) {
  const ALL_PURPOSE_ID = TEAM_EVALUATION_OFFSET_ID + 8;
  const AUTONOMOUS_COURSES_ORGANIZATION_ID = process.env.AUTONOMOUS_COURSES_ORGANIZATION_ID;

  await organization.createOrganization({
    databaseBuilder,
    organizationId: AUTONOMOUS_COURSES_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Organisation pour les parcours autonomes',
    isManagingStudents: true,
    externalId: 'SCO_MANAGING',
    adminIds: [SCO_ORGANIZATION_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
    featureIds: [FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID],
  });

  databaseBuilder.factory.buildMembership({
    userId: REAL_PIX_SUPER_ADMIN_ID,
    organizationId: AUTONOMOUS_COURSES_ORGANIZATION_ID,
    organizationRole: 'ADMIN',
  });

  const configTargetProfile = {
    frameworks: [
      {
        chooseCoreFramework: true,
        countTubes: 5,
        minLevel: 3,
        maxLevel: 5,
      },
    ],
  };

  await createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID,
    ownerOrganizationId: AUTONOMOUS_COURSES_ORGANIZATION_ID,
    name: 'Profil cible pour parcours autonomes',
    isPublic: true,
    isSimplifiedAccess: true,
    description: 'Profil cible pour parcours autonomes',
    configTargetProfile,
  });
}

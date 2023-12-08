import dayjs from 'dayjs';
import { AUTONOMOUS_COURSES_ID } from '../constants.js';
import { PRO_ORGANIZATION_USER_ID, ALL_ORGANIZATION_USER_ID } from '../../common/constants.js';
import { REAL_PIX_SUPER_ADMIN_ID } from '../../common/common-builder.js';
import * as tooling from '../../common/tooling/index.js';

export default async function initUser(databaseBuilder) {
  // 1. Create autonomous-courses specific organization
  const { id: specificOrganizationId } = await databaseBuilder.factory.buildOrganization({
    id: process.env.AUTONOMOUS_COURSES_ORGANIZATION_ID || AUTONOMOUS_COURSES_ID,
    type: 'PRO',
    externalId: 'AUTONOMOUS_COURSES',
    name: 'Autonomous courses organization',
    isManagingStudents: false,
    adminIds: [PRO_ORGANIZATION_USER_ID],
    memberIds: [ALL_ORGANIZATION_USER_ID],
  });

  // 2. Create membership between superadmin user and our specific organization
  databaseBuilder.factory.buildMembership({
    userId: REAL_PIX_SUPER_ADMIN_ID,
    organizationId: specificOrganizationId,
    organizationRole: 'ADMIN',
  });

  // 3. Create autonomous-courses
  //    Each campaign is linked to a public and simplified-access target-profile.
  //    Those target-profiles are owned by our specific organization.
  for (let i = 1; i < 6; i++) {
    // 3.1. Create some target-profiles owned by our specific organization
    await tooling.targetProfile.createTargetProfile({
      databaseBuilder,
      ownerOrganizationId: specificOrganizationId,
      targetProfileId: AUTONOMOUS_COURSES_ID + i,
      isPublic: true,
      isSimplifiedAccess: true,
      name: `Profil-cible pour parcours autonome n°${i}`,
      description: 'Profil cible pour parcours autonome',
      category: ['Les 16 compétences', 'Thématiques', 'Parcours sur-mesure', 'Parcours prédéfinis', 'Autres'][i - 1],
      configTargetProfile: {
        frameworks: [
          {
            chooseCoreFramework: true,
            countTubes: 2,
            minLevel: 2,
            maxLevel: 3,
          },
        ],
      },
    });

    // 3.2. Create assessment campaigns linked to those target-profiles
    await tooling.campaign.createAssessmentCampaign({
      databaseBuilder,
      targetProfileId: AUTONOMOUS_COURSES_ID + i,
      organizationId: specificOrganizationId,
      ownerId: REAL_PIX_SUPER_ADMIN_ID,
      name: `Parcours autonome n°${i}`,
      code: `AUTOCOURS${i}`,
      createdAt: dayjs().subtract(30, 'days').toDate(),
      configCampaign: {
        participantCount: 0,
      },
    });
  }
}

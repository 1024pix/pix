import dayjs from 'dayjs';

import { categories } from '../../../../../src/shared/domain/models/TargetProfile.js';
import {
  COUNTRY_FRANCE_CODE,
  REAL_PIX_SUPER_ADMIN_ID,
  USER_ID_ADMIN_ORGANIZATION,
  USER_ID_MEMBER_ORGANIZATION,
} from '../../common/constants.js';
import * as tooling from '../../common/tooling/index.js';
import {
  ADMINISTRATION_TEAM_SOLO_ID,
  ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
} from '../../team-acquisition/constants.js';
import { AUTONOMOUS_COURSES_ID } from '../constants.js';

export default async function initUser(databaseBuilder) {
  // 1. Create autonomous-courses specific organization
  const { id: specificOrganizationId } = await databaseBuilder.factory.buildOrganization({
    id: process.env.AUTONOMOUS_COURSES_ORGANIZATION_ID || AUTONOMOUS_COURSES_ID,
    type: 'PRO',
    externalId: 'AUTONOMOUS_COURSES',
    name: 'Autonomous courses organization',
    isManagingStudents: false,
    adminIds: [USER_ID_ADMIN_ORGANIZATION],
    memberIds: [USER_ID_MEMBER_ORGANIZATION],
    administrationTeamId: ADMINISTRATION_TEAM_SOLO_ID,
    organizationLearnerTypeId: ORGANIZATION_LEARNER_TYPE_PROFESSIONAL_ID,
    countryCode: COUNTRY_FRANCE_CODE,
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
    const { targetProfileId, cappedTubesDTO } = await tooling.targetProfile.createTargetProfile({
      databaseBuilder,
      targetProfileId: AUTONOMOUS_COURSES_ID + i,
      isSimplifiedAccess: true,
      name: `Profil-cible pour parcours autonome n°${i}`,
      description: 'Profil cible pour parcours autonome',
      category: [
        categories.COMPETENCES,
        categories.SUBJECT,
        categories.CUSTOM,
        categories.PREDEFINED,
        categories.OTHER,
      ][i - 1],
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
    databaseBuilder.factory.buildTargetProfileShare({
      organizationId: specificOrganizationId,
      targetProfileId: AUTONOMOUS_COURSES_ID + i,
    });

    // 3.2. Create assessment campaigns linked to those target-profiles
    await tooling.campaign.createAssessmentCampaign({
      databaseBuilder,
      targetProfileId: targetProfileId,
      organizationId: specificOrganizationId,
      ownerId: REAL_PIX_SUPER_ADMIN_ID,
      code: `AUTOCOUR${i}`,
      name: `Parcours autonome n°${i}`,
      title: `Titre principal du parcours autonome n°${i}`,
      customLandingPageText: `<strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit. Mauris eget tortor ut diam dictum viverra quis at purus. Morbi id quam a massa blandit gravida.`,
      createdAt: dayjs().subtract(30, 'days').toDate(),
      externalIdLabel: null,
      configCampaign: {
        participantCount: 0,
      },
    });

    // 3.3. Build target-profile stages
    await tooling.targetProfile.createStages({
      databaseBuilder,
      targetProfileId: targetProfileId,
      cappedTubesDTO: cappedTubesDTO,
      type: 'LEVEL',
      countStages: 3,
      includeFirstSkill: false,
    });
  }

  // 4. Create training for first autonomous course
  const frTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Apprendre à manger un pain au chocolat comme les français',
    locale: 'fr',
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: AUTONOMOUS_COURSES_ID + 1,
    trainingId: frTrainingId,
  });

  const frTrainingTriggerId = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frTrainingId,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frTrainingTriggerId,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });
}

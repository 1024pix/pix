import dayjs from 'dayjs';

import { usecases } from '../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
} from '../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { PRO_ORGANIZATION_ID, USER_ID_ADMIN_ORGANIZATION } from '../common/constants.js';
import { createAssessmentCampaign, createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import { createProfileGivenCompetences } from '../common/tooling/profile-tooling.js';
import { TARGET_PROFILE_BADGES_STAGES_ID, TARGET_PROFILE_NO_BADGES_NO_STAGES_ID } from './constants.js';

async function createProCampaignProfileCollection(databaseBuilder) {
  const { campaignId } = await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'Campagne de collecte de profil PRO',
    code: 'PROCOLMUL',
    externalIdLabel: 'Mets ton adresse mail',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: true,
  });

  const jeanBonUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Jean',
    lastName: 'Bon',
    username: null,
    email: 'jean.bon@prescription.com',
  });

  const jeanBonOrganizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner(
    {
      firstName: jeanBonUser.firstName,
      lastName: jeanBonUser.lastName,
      deletedAt: null,
      createdAt: dayjs().subtract(15, 'days').toDate(),
      isDisabled: false,
      userId: jeanBonUser.id,
      organizationId: PRO_ORGANIZATION_ID,
    },
  );

  // ke before being a learner
  await createProfileGivenCompetences({
    databaseBuilder,
    userId: jeanBonUser.id,
    competenceToPick: 1,
    createdAt: dayjs().subtract(16, 'days').toDate(),
  });

  // ke when being a learner
  const jeanBonCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    userId: jeanBonUser.id,
    participantExternalId: jeanBonUser.email,
    organizationLearnerId: jeanBonOrganizationLearner.id,
    campaignId,
    status: CampaignParticipationStatuses.TO_SHARE,
    deletedAt: null,
    createdAt: dayjs().subtract(10, 'days').toDate(),
  }).id;

  await databaseBuilder.commit();
  await usecases.shareCampaignResult({
    userId: jeanBonUser.id,
    campaignParticipationId: jeanBonCampaignParticipationId,
  });
}

async function createProAssessmentMultipleSendingsCampaign(databaseBuilder) {
  const { campaignId } = await createAssessmentCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO",
    code: 'PROASSMUL',
    externalIdLabel: 'Mets ton adresse mail',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: true,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
  });

  const tristeTempsUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Triste',
    lastName: 'Temps',
    username: null,
    email: 'triste.temps@prescription.com',
  });

  const tristeTempsOrganizationLearner =
    databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
      firstName: tristeTempsUser.firstName,
      lastName: tristeTempsUser.lastName,
      deletedAt: null,
      createdAt: dayjs().subtract(15, 'days').toDate(),
      isDisabled: false,
      userId: tristeTempsUser.id,
      organizationId: PRO_ORGANIZATION_ID,
    });

  // ke before being a learner
  await createProfileGivenCompetences({
    databaseBuilder,
    userId: tristeTempsUser.id,
    competenceToPick: 1,
    createdAt: dayjs().subtract(16, 'days').toDate(),
  });

  // ke when being a learner
  const tristeTempsCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    userId: tristeTempsUser.id,
    participantExternalId: tristeTempsUser.email,
    organizationLearnerId: tristeTempsOrganizationLearner.id,
    campaignId,
    status: CampaignParticipationStatuses.TO_SHARE,
    deletedAt: null,
    createdAt: dayjs().subtract(10, 'days').toDate(),
  }).id;

  databaseBuilder.factory.buildAssessment({
    userId: tristeTempsUser.id,
    organizationLearnerId: tristeTempsOrganizationLearner.id,
    state: Assessment.states.COMPLETED,
    type: Assessment.types.CAMPAIGN,
    campaignParticipationId: tristeTempsCampaignParticipationId,
    courseId: null,
    isImproving: false,
    competenceId: null,
  });

  await databaseBuilder.commit();
  await usecases.shareCampaignResult({
    userId: tristeTempsUser.id,
    campaignParticipationId: tristeTempsCampaignParticipationId,
  });
}

async function createProAssessmentCampaign(databaseBuilder) {
  const { campaignId } = await createAssessmentCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO",
    code: 'PROASSIMP',
    externalIdLabel: 'Mets ton identifiant',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: false,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
  });
  const beauTempsUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Triste',
    lastName: 'Temps',
    username: null,
    email: 'beau.temps@prescription.com',
  });

  const beauTempsOrganizationLearner =
    databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
      firstName: beauTempsUser.firstName,
      lastName: beauTempsUser.lastName,
      deletedAt: null,
      createdAt: dayjs().subtract(15, 'days').toDate(),
      isDisabled: false,
      userId: beauTempsUser.id,
      organizationId: PRO_ORGANIZATION_ID,
    });

  // ke before being a learner
  await createProfileGivenCompetences({
    databaseBuilder,
    userId: beauTempsUser.id,
    competenceToPick: 1,
    createdAt: dayjs().subtract(16, 'days').toDate(),
  });

  // ke when being a learner
  const beauTempsCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    userId: beauTempsUser.id,
    participantExternalId: beauTempsUser.email,
    organizationLearnerId: beauTempsOrganizationLearner.id,
    campaignId,
    status: CampaignParticipationStatuses.TO_SHARE,
    deletedAt: null,
    createdAt: dayjs().subtract(10, 'days').toDate(),
  }).id;

  databaseBuilder.factory.buildAssessment({
    userId: beauTempsUser.id,
    organizationLearnerId: beauTempsOrganizationLearner.id,
    state: Assessment.states.COMPLETED,
    type: Assessment.types.CAMPAIGN,
    campaignParticipationId: beauTempsCampaignParticipationId,
    courseId: null,
    isImproving: false,
    competenceId: null,
  });

  await databaseBuilder.commit();
  //TODO: utiliser assessment-controller-auto-validate-next-challenge pour les seeds de l'assessment ?

  await usecases.shareCampaignResult({
    userId: beauTempsUser.id,
    campaignParticipationId: beauTempsCampaignParticipationId,
  });
}

export { createProAssessmentCampaign, createProAssessmentMultipleSendingsCampaign, createProCampaignProfileCollection };

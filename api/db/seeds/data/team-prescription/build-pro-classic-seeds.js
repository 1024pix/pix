import dayjs from 'dayjs';

import { usecases } from '../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
} from '../../../../src/prescription/shared/domain/constants.js';
import { PRO_ORGANIZATION_ID, USER_ID_ADMIN_ORGANIZATION } from '../common/constants.js';
import { createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import { createProfileGivenCompetences } from '../common/tooling/profile-tooling.js';

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
  const { campaignId } = await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO",
    code: 'PROASSMUL',
    externalIdLabel: 'Mets ton adresse mail',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: true,
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

  await databaseBuilder.commit();
  await usecases.shareCampaignResult({
    userId: tristeTempsUser.id,
    campaignParticipationId: tristeTempsCampaignParticipationId,
  });
}

async function createProAssessmentCampaign(databaseBuilder) {
  const { campaignId } = await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO",
    code: 'PROASSIMP',
    externalIdLabel: 'Mets ton identifiant',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: false,
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

  await databaseBuilder.commit();
  await usecases.shareCampaignResult({
    userId: tristeTempsUser.id,
    campaignParticipationId: tristeTempsCampaignParticipationId,
  });
}

export { createProAssessmentCampaign, createProAssessmentMultipleSendingsCampaign, createProCampaignProfileCollection };

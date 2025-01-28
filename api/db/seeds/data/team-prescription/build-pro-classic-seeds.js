import dayjs from 'dayjs';

import {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
} from '../../../../src/prescription/shared/domain/constants.js';
import { PRO_ORGANIZATION_ID, USER_ID_ADMIN_ORGANIZATION } from '../common/constants.js';
import { createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import { createCertifiableProfile } from '../common/tooling/profile-tooling.js';

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
    },
  );

  await createCertifiableProfile({ databaseBuilder, userId: jeanBonUser.id });
  // const ke before being a learner
  // const ke when being a learner

  databaseBuilder.factory.buildCampaignParticipation({
    userId: jeanBonUser.id,
    participantExternalId: jeanBonUser.email,
    organizationLearnerId: jeanBonOrganizationLearner.id,
    campaignId,
    status: CampaignParticipationStatuses.TO_SHARE,
    deletedAt: null,
    createdAt: dayjs().subtract(10, 'days').toDate(),
  });

  return databaseBuilder.commit();
}

export { createProCampaignProfileCollection };

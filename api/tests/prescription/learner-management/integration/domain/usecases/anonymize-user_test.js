import { expect } from 'chai';

import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | anonymize-user', function () {
  it('should detach user from deleted campaign-participations', async function () {
    const userId = databaseBuilder.factory.buildUser().id;
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId }).id;
    databaseBuilder.factory.buildCampaignParticipation({ userId, organizationLearnerId, deletedAt: new Date() });
    await databaseBuilder.commit();

    await usecases.anonymizeUser({ userId });

    const participationsAfter = await knex('campaign-participations').where({ userId });
    expect(participationsAfter).to.have.lengthOf(0);
  });

  it('should detach user from campaign-participations linked to a learner not attached to the user', async function () {
    const userId = databaseBuilder.factory.buildUser().id;
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId: null }).id;
    databaseBuilder.factory.buildCampaignParticipation({ userId, organizationLearnerId });
    await databaseBuilder.commit();

    await usecases.anonymizeUser({ userId });

    const participationsAfter = await knex('campaign-participations').where({ userId });
    expect(participationsAfter).to.have.lengthOf(0);
  });

  it('should anonymize organization-learners', async function () {
    const userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildOrganizationLearner({ userId });
    databaseBuilder.factory.buildOrganizationLearner({ userId });
    await databaseBuilder.commit();
    const learnersBefore = await knex('organization-learners').where({ userId });
    expect(learnersBefore).to.have.lengthOf(2);

    await usecases.anonymizeUser({ userId });

    const learnersAfter = await knex('organization-learners').where({ userId });
    expect(learnersAfter).to.have.lengthOf(0);
  });

  it('should anonymize campaign-participations', async function () {
    const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
    databaseBuilder.factory.buildCampaignParticipation();

    await databaseBuilder.commit();

    await usecases.anonymizeUser({ userId: campaignParticipation.userId });

    const campaignParticipationsFound = await knex('campaign-participations').whereNull('userId');
    expect(campaignParticipationsFound).lengthOf(1);
    expect(campaignParticipationsFound[0].id).to.equal(campaignParticipation.id);
  });
});

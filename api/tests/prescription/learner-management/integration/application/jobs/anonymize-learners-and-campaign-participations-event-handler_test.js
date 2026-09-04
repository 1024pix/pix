import { expect } from 'chai';

import { AnonymizeLearnersAndCampaignParticipationsEventHandler } from '../../../../../../src/prescription/learner-management/application/jobs/anonymize-learners-and-campaign-participations-event-handler.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | Prescription | Learner Management | Application | Jobs | anonymize-learners-and-campaign-participations-event-handler', function () {
  describe('#handle', function () {
    it('should anonymize the organization-learners of the user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildOrganizationLearner({ userId });
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeLearnersAndCampaignParticipationsEventHandler();
      await handler.handle({ data: { userId } });

      // then
      const learners = await knex('organization-learners').where({ userId });
      expect(learners).to.have.lengthOf(0);
    });

    it('should anonymize the campaign-participations of the user', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      await databaseBuilder.commit();

      // when
      const handler = new AnonymizeLearnersAndCampaignParticipationsEventHandler();
      await handler.handle({ data: { userId: campaignParticipation.userId } });

      // then
      const campaignParticipationsFound = await knex('campaign-participations').whereNull('userId');
      expect(campaignParticipationsFound).to.have.lengthOf(1);
      expect(campaignParticipationsFound[0].id).to.equal(campaignParticipation.id);
    });
  });
});

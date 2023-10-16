import { expect, knex, databaseBuilder, sinon } from '../../../../../test-helper.js';
import { removeByOrganizationLearnerIds } from '../../../../../../src/prescription/learner-management/infrastructure/repositories/campaign-participation-repository.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Repository | Organization Learners Management | Campaign Participation', function () {
  describe('#removeByOrganizationLearnerIds', function () {
    let clock;
    const now = new Date('2023-02-02');
    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
    });
    afterEach(function () {
      clock.restore();
    });

    it('delete participations of one organization learner', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ userId });
      const { organizationLearnerId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, isImproved: true, organizationLearnerId });

      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByOrganizationLearnerIds({
          organizationLearnerIds: [organizationLearnerId],
          userId,
          domainTransaction,
        });
      });
      // then
      const campaignParticipationResult = await knex('campaign-participations')
        .select('deletedAt', 'deletedBy')
        .where({ organizationLearnerId })
        .first();

      expect(campaignParticipationResult.deletedAt).to.deep.equal(now);
      expect(campaignParticipationResult.deletedBy).to.equal(userId);
    });

    it('delete participations of more than one organization learner', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ userId });
      const { organizationLearnerId: organizationLearnerId1 } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      });
      const { organizationLearnerId: organizationLearnerId2 } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      });

      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByOrganizationLearnerIds({
          organizationLearnerIds: [organizationLearnerId1, organizationLearnerId2],
          userId,
          domainTransaction,
        });
      });

      // then
      const campaignParticipationResult = await knex('campaign-participations')
        .select('deletedAt', 'deletedBy')
        .whereIn('organizationLearnerId', [organizationLearnerId1, organizationLearnerId2])
        .whereNull('deletedAt');

      expect(campaignParticipationResult.length).to.equal(0);
    });

    it('should not override participations already deleted', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const { id: campaignId } = databaseBuilder.factory.buildCampaign();
      const { organizationLearnerId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        deletedAt: new Date('2021-05-01'),
      });

      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByOrganizationLearnerIds({
          organizationLearnerIds: [organizationLearnerId],
          userId,
          domainTransaction,
        });
      });
      // then
      const campaignParticipationResult = await knex('campaign-participations')
        .select('deletedAt', 'deletedBy')
        .where({ organizationLearnerId })
        .first();

      expect(campaignParticipationResult.deletedAt).to.deep.equal(new Date('2021-05-01'));
    });
  });
});

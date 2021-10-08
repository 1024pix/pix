const campaignParticipationsStatsRepository = require('../../../../lib/infrastructure/repositories/campaign-participations-stats-repository');
const { expect, databaseBuilder } = require('../../../test-helper');

describe('Integration | Repository | Campaign Participations Stats', function () {
  describe('#getParticipationsActivityByDate', function () {
    context('when there are no participations', function () {
      it('should return an empty array', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.startedParticipations).deep.equal([]);
        expect(activityByDate.sharedParticipations).deep.equal([]);
      });
    });

    context('when there are participations', function () {
      it('should return the cumulative sum of participation for the campaign', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-02' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-03' });
        databaseBuilder.factory.buildCampaignParticipation({ createdAt: '2021-01-01' });
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.startedParticipations).deep.equal([
          { day: '2021-01-02', count: 1 },
          { day: '2021-01-03', count: 2 },
        ]);
      });

      it('should return the cumulative sum of shared participation for the campaign', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-01',
          isShared: true,
          sharedAt: '2021-01-01',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-01',
          isShared: true,
          sharedAt: '2021-01-03',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-02',
          isShared: false,
          sharedAt: null,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          createdAt: '2021-01-01',
          isShared: true,
          sharedAt: '2021-01-01',
        });
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.sharedParticipations).deep.equal([
          { day: '2021-01-01', count: 1 },
          { day: '2021-01-03', count: 2 },
        ]);
      });
    });
  });

  describe('#countParticipationsByMasteryRate', function () {
    context('When there is no shared participation', function () {
      it('return an empty array', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false });

        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });

        expect(resultDistribution).to.be.empty;
      });
    });

    context('When there are shared participation', function () {
      it('returns the participation count by mastery rate', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: 0.2 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: 0.1 });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([
          { count: 2, masteryRate: '0.10' },
          { count: 1, masteryRate: '0.20' },
        ]);
      });
    });

    context('When there are shared participation for other campaign', function () {
      it('returns only participation count for given campaign', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: 0.2 });
        const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          isShared: true,
          masteryRate: 0.2,
        });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([
          { count: 1, masteryRate: '0.10' },
          { count: 1, masteryRate: '0.20' },
        ]);
      });
    });

    context('When there are participation without mastery rate', function () {
      it('returns only participation count for participation with mastery rate', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: null });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([{ count: 1, masteryRate: '0.10' }]);
      });
    });

    context('When there are participation not shared', function () {
      it('returns only shared participation', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true, masteryRate: 1 });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([{ count: 1, masteryRate: '1.00' }]);
      });
    });

    context('When there are participants whith several participations', function () {
      it('counts the last participation for each participant', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isShared: true,
          masteryRate: 0.5,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isShared: true,
          masteryRate: 1,
          isImproved: false,
        });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([{ count: 1, masteryRate: '1.00' }]);
      });
    });
  });
});

const campaignParticipationsStatsRepository = require('../../../../lib/infrastructure/repositories/campaign-participations-stats-repository');
const { expect, databaseBuilder } = require('../../../test-helper');

describe('Integration | Repository | Campaign Participations Stats', function() {
  describe('#getParticipationsActivityByDate', function() {
    context('when there are no participations', function() {
      it('should return an empty array', async function() {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.startedParticipations).deep.equal([]);
        expect(activityByDate.sharedParticipations).deep.equal([]);
      });
    });

    context('when there are participations', function() {
      it('should return the cumulative sum of participation for the campaign', async function() {
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

      it('should return the cumulative sum of shared participation for the campaign', async function() {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-01', isShared: true, sharedAt: '2021-01-01' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-01', isShared: true, sharedAt: '2021-01-03' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-02', isShared: false, sharedAt: null });
        databaseBuilder.factory.buildCampaignParticipation({ createdAt: '2021-01-01', isShared: true, sharedAt: '2021-01-01' });
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.sharedParticipations).deep.equal([
          { day: '2021-01-01', count: 1 },
          { day: '2021-01-03', count: 2 },
        ]);
      });
    });
  });
});

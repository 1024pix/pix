const { expect, databaseBuilder } = require('../../../test-helper');
const CampaignProfilesCollectionParticipationSummary = require('../../../../lib/domain/models/CampaignProfilesCollectionParticipationSummary');
const CampaignProfilesCollectionParticipationSummaryRepository = require('../../../../lib/infrastructure/repositories/campaign-profiles-collection-participation-summary-repository');

describe('Integration | Repository | Campaign Profiles Collection Participation Summary repository', () => {

  describe('#findPaginatedByCampaignId', () => {

    let campaignId;
    const sharedAt = new Date('2018-05-06');

    beforeEach(async () => {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    it('should return empty array if no participant', async () => {
      // when
      const results = await CampaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

      // then
      expect(results.data.length).to.equal(0);
    });

    it('should return participant data summary for the campaign participation', async () => {
      // given
      const campaignParticipation = { id: 1, campaignId, isShared: true, sharedAt, participantExternalId: 'JeBu' };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jérémy', lastName: 'bugietta' }, campaignParticipation);
      await databaseBuilder.commit();

      // when
      const results = await CampaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);

      // then
      expect(results.data).to.deep.equal([
        new CampaignProfilesCollectionParticipationSummary({
          campaignParticipationId: campaignParticipation.id,
          firstName: 'Jérémy',
          lastName: 'bugietta',
          participantExternalId: 'JeBu',
          sharedAt,
        })
      ]);
    });

    it('should return participants data summary only for the given campaign id', async () => {
      // given
      const campaignParticipation1 = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Lise', lastName: 'Quesnel' }, campaignParticipation1);
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipation2 = { campaignId: campaignId2 };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Benjamin', lastName: 'Petetot' }, campaignParticipation2);
      await databaseBuilder.commit();

      // when
      const results = await CampaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Lise']);
    });

    it('should return participants data summary ordered by last name then first name asc', async () => {
      // given
      const campaignParticipation = { campaignId };
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Lise', lastName: 'Quesnel' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Benjamin', lastName: 'Petetot' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Yvonnick', lastName: 'Frin' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Arthur', lastName: 'Frin' }, campaignParticipation);
      databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Estelle', lastName: 'Landry' }, campaignParticipation);
      await databaseBuilder.commit();

      // when
      const results = await CampaignProfilesCollectionParticipationSummaryRepository.findPaginatedByCampaignId(campaignId);
      const names = results.data.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Arthur', 'Yvonnick', 'Estelle', 'Benjamin', 'Lise']);
    });
  });
});

const { expect, databaseBuilder } = require('../../../test-helper');
const CampaignProfilesCollectionParticipantSummary = require('../../../../lib/domain/models/CampaignProfilesCollectionParticipantSummary');
const campaignProfilesCollectionParticipantSummaryRepository = require('../../../../lib/infrastructure/repositories/campaign-profiles-collection-participant-summary-repository');

const createCampaignParticipation = (member, campaignParticipation) => {
  const { id: userId } = databaseBuilder.factory.buildUser(member);
  return databaseBuilder.factory.buildCampaignParticipation({ userId, ...campaignParticipation });
};

describe('Integration | Repository | Campaign Profiles Collection Participant Summary repository', () => {

  describe('#findByCampaignId', () => {

    let campaignId;
    const sharedAt = new Date('2018-05-06');

    beforeEach(async () => {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    it('should return empty array if no participant', async () => {
      // when
      const results = await campaignProfilesCollectionParticipantSummaryRepository.findByCampaignId(campaignId);

      // then
      expect(results.length).to.equal(0);
    });

    it('should return participant data summary for the campaign participation', async () => {
      // given
      const campaignParticipation = { id: 1, campaignId, isShared: true, sharedAt, participantExternalId: 'JeBu' };
      createCampaignParticipation({ firstName: 'Jérémy', lastName: 'bugietta' }, campaignParticipation);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipantSummaryRepository.findByCampaignId(campaignId);

      // then
      expect(results).to.deep.equal([
        new CampaignProfilesCollectionParticipantSummary({
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
      createCampaignParticipation({ firstName: 'Lise', lastName: 'Quesnel' }, campaignParticipation1);
      const campaignId2 = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipation2 = { campaignId: campaignId2 };
      createCampaignParticipation({ firstName: 'Benjamin', lastName: 'Petetot' }, campaignParticipation2);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipantSummaryRepository.findByCampaignId(campaignId);
      const names = results.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Lise']);
    });

    it('should return participants data summary ordered by last name then first name asc', async () => {
      // given
      const campaignParticipation = { campaignId };
      createCampaignParticipation({ firstName: 'Lise', lastName: 'Quesnel' }, campaignParticipation);
      createCampaignParticipation({ firstName: 'Benjamin', lastName: 'Petetot' }, campaignParticipation);
      createCampaignParticipation({ firstName: 'Yvonnick', lastName: 'Frin' }, campaignParticipation);
      createCampaignParticipation({ firstName: 'Arthur', lastName: 'Frin' }, campaignParticipation);
      createCampaignParticipation({ firstName: 'Estelle', lastName: 'Landry' }, campaignParticipation);
      await databaseBuilder.commit();

      // when
      const results = await campaignProfilesCollectionParticipantSummaryRepository.findByCampaignId(campaignId);
      const names = results.map((result) => result.firstName);

      // then
      expect(names).exactlyContainInOrder(['Arthur','Yvonnick','Estelle','Benjamin','Lise']);
    });
  });
});

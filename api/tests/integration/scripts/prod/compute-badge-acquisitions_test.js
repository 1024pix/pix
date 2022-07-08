const { expect, databaseBuilder } = require('../../../test-helper');
const { getCampaignParticipationsBetweenIds } = require('../../../../scripts/prod/compute-badge-acquisitions');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

describe('Script | Prod | Compute Badge Acquisitions', function () {
  describe('#getCampaignParticipationsBetweenIds', function () {
    it('should return campaign participation between idMin and idMax', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation();
      const id2 = databaseBuilder.factory.buildCampaignParticipation().id;
      const id3 = databaseBuilder.factory.buildCampaignParticipation().id;
      const id4 = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();

      // when
      const campaignParticipations = await getCampaignParticipationsBetweenIds({ idMin: id2, idMax: id4 });

      // then
      expect(campaignParticipations.length).to.equal(3);
      expect(campaignParticipations.map(({ id }) => id)).to.deep.equal([id2, id3, id4]);
      expect(campaignParticipations[0]).to.be.instanceOf(CampaignParticipation);
    });
  });
});

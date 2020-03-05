const CampaignTubeCollectiveResult = require('../../../../lib/domain/models/CampaignTubeCollectiveResult');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | CampaignTubeCollectiveResult', () => {

  describe('@id', () => {

    it('should return a unique identifier that is the concatenation of "campaignId" and "tubeId"', () => {
      // given
      const campaignId = 123;
      const tubeId = 'recTube';
      const competenceResult = new CampaignTubeCollectiveResult({ campaignId, tubeId });

      // when
      const competenceResultId = competenceResult.id;

      // then
      expect(competenceResultId).to.equal('123_recTube');
    });
  });

});

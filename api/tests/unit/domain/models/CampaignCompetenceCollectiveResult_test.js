const CampaignCompetenceCollectiveResult = require('$lib/domain/models/CampaignCompetenceCollectiveResult');
const { expect } = require('$tests/test-helper');

describe('Unit | Domain | Models | CampaignCompetenceCollectiveResult', () => {

  describe('@id', () => {

    it('should return a unique identifier that is the concatenation of "campaignId" and "competenceId"', () => {
      // given
      const campaignId = 123;
      const competenceId = 'recCompetence';
      const competenceResult = new CampaignCompetenceCollectiveResult({ campaignId, competenceId });

      // when
      const competenceResultId = competenceResult.id;

      // then
      expect(competenceResultId).to.equal('123_recCompetence');
    });
  });

  describe('@areaCode', () => {

    it('should return the area index covered by the competence', () => {
      // given
      const competenceIndex = '1.2';
      const competenceResult = new CampaignCompetenceCollectiveResult({ competenceIndex });

      // when
      const areaCode = competenceResult.areaCode;

      // then
      expect(areaCode).to.equal('1');
    });
  });

});

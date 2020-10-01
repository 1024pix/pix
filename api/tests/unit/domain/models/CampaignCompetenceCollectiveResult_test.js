const CampaignCompetenceCollectiveResult = require('../../../../lib/domain/models/CampaignCompetenceCollectiveResult');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CampaignCompetenceCollectiveResult', () => {

  describe('@id', () => {

    it('should return a unique identifier that is the concatenation of "campaignId" and "competenceId"', () => {
      // given
      const campaignId = 123;
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence' });
      const targetedArea = domainBuilder.buildTargetedArea();
      const competenceResult = new CampaignCompetenceCollectiveResult({ campaignId, targetedCompetence, targetedArea });

      // when
      const competenceResultId = competenceResult.id;

      // then
      expect(competenceResultId).to.equal('123_recCompetence');
    });
  });

  describe('@areaCode', () => {

    it('should return the area index covered by the competence', () => {
      // given
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ index: '1.2' });
      const targetedArea = domainBuilder.buildTargetedArea();
      const competenceResult = new CampaignCompetenceCollectiveResult({ targetedCompetence, targetedArea });

      // when
      const areaCode = competenceResult.areaCode;

      // then
      expect(areaCode).to.equal('1');
    });
  });

});

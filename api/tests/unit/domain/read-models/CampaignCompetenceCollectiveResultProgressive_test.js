const CampaignCompetenceCollectiveResultProgressive = require('../../../../lib/domain/read-models/CampaignCompetenceCollectiveResultProgressive');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignCompetenceCollectiveResultProgressive', () => {

  describe('@id', () => {

    it('should return a unique identifier that is the concatenation of "campaignId" and "competenceId"', () => {
      // given
      const campaignId = 123;
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence' });
      const targetedArea = domainBuilder.buildTargetedArea();
      const competenceResult = new CampaignCompetenceCollectiveResultProgressive({ campaignId, targetedCompetence, targetedArea });

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
      const competenceResult = new CampaignCompetenceCollectiveResultProgressive({ targetedCompetence, targetedArea });

      // when
      const areaCode = competenceResult.areaCode;

      // then
      expect(areaCode).to.equal('1');
    });
  });

  describe('addValidatedSkillCount()', () => {

    it('should add up to obtain expected averageValidatedSkills when finalizing', () => {
      // given
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ index: '1.2' });
      const targetedArea = domainBuilder.buildTargetedArea();
      const competenceResult = new CampaignCompetenceCollectiveResultProgressive({ targetedCompetence, targetedArea });
      competenceResult.addValidatedSkillCount(10);
      competenceResult.addValidatedSkillCount(2);

      // when
      competenceResult.finalize(3);

      // then
      expect(competenceResult.averageValidatedSkills).to.equal(4);
    });
  });

  describe('finalize()', () => {

    it('should init averageValidatedSkills to 0 when participant count is equal 0', () => {
      // given
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ index: '1.2' });
      const targetedArea = domainBuilder.buildTargetedArea();
      const competenceResult = new CampaignCompetenceCollectiveResultProgressive({ targetedCompetence, targetedArea });

      // when
      competenceResult.finalize(0);

      // then
      expect(competenceResult.averageValidatedSkills).to.equal(0);
    });

    it('should init averageValidatedSkills accordingly depending on participant count and validated skill count', () => {
      // given
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ index: '1.2' });
      const targetedArea = domainBuilder.buildTargetedArea();
      const competenceResult = new CampaignCompetenceCollectiveResultProgressive({ targetedCompetence, targetedArea });
      competenceResult.addValidatedSkillCount(10);
      competenceResult.addValidatedSkillCount(2);

      // when
      competenceResult.finalize(3);

      // then
      expect(competenceResult.averageValidatedSkills).to.equal(4);
    });
  });

});

const CampaignCollectiveResultProgressive = require('../../../../lib/domain/read-models/CampaignCollectiveResultProgressive');
const CampaignCompetenceCollectiveResultProgressive = require('../../../../lib/domain/read-models/CampaignCompetenceCollectiveResultProgressive');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignCollectiveResultProgressive', () => {

  describe('constructor', () => {

    it('should initialize as many CampaignCompetenceCollectiveResultProgressive objects as competences in target profile', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId' });
      const targetedCompetence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', areaId: 'recAreaId' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1, targetedCompetence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1, targetedCompetence2],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResultProgressive({ id: 123, targetProfile });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults).to.have.length(2);
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0]).to.be.instanceOf(CampaignCompetenceCollectiveResultProgressive);
    });

    it('should order CampaignCompetenceCollectiveResultProgressive by competenceIndex', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId', index: '3.1' });
      const targetedCompetence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', areaId: 'recAreaId', index: '1.1' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1, targetedCompetence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1, targetedCompetence2],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResultProgressive({ id: 123, targetProfile });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].competenceIndex).to.equal('1.1');
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[1].competenceIndex).to.equal('3.1');
    });
  });

  describe('addValidatedSkillCountToCompetences()', () => {

    it('should add up to obtain expected averageValidatedSkills when finalizing on appropriate competence', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId', index: '1.1' });
      const targetedCompetence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', areaId: 'recAreaId', index: '2.1' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1, targetedCompetence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1, targetedCompetence2],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResultProgressive({ id: 123, targetProfile });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ 'recCompetence1': 5, 'recCompetence2': 3 });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ 'recCompetence2': 6 });

      // when
      campaignCollectiveResult.finalize(2);

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].averageValidatedSkills).to.equal(2.5);
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[1].averageValidatedSkills).to.equal(4.5);
    });
  });

  describe('finalize()', () => {

    it('should obtain expected averageValidatedSkills when finalizing on appropriate competence', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId', index: '1.1' });
      const targetedCompetence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', areaId: 'recAreaId', index: '2.1' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1, targetedCompetence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1, targetedCompetence2],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResultProgressive({ id: 123, targetProfile });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ 'recCompetence1': 5, 'recCompetence2': 3 });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ 'recCompetence2': 6 });

      // when
      campaignCollectiveResult.finalize(2);

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].averageValidatedSkills).to.equal(2.5);
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[1].averageValidatedSkills).to.equal(4.5);
    });
  });
});

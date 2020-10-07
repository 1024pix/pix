const CampaignCollectiveResult = require('../../../../lib/domain/read-models/CampaignCollectiveResult');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignCollectiveResult', () => {

  describe('constructor', () => {

    it('should initialize as many CampaignCompetenceCollectiveResult objects as competences in target profile', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId' });
      const targetedCompetence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', areaId: 'recAreaId' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1, targetedCompetence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1, targetedCompetence2],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, targetProfile });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults).to.have.length(2);
    });

    it('should order CampaignCompetenceCollectiveResult by competenceIndex', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId', index: '3.1' });
      const targetedCompetence2 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence2', areaId: 'recAreaId', index: '1.1' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1, targetedCompetence2] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1, targetedCompetence2],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, targetProfile });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].competenceId).to.equal('recCompetence2');
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[1].competenceId).to.equal('recCompetence1');
    });

    it('should initialize CampaignCompetenceCollectiveResult with a computed id', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId', index: '3.1' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, targetProfile });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].id).to.equal('123_recCompetence1');
    });

    it('should initialize CampaignCompetenceCollectiveResult with a computed areaCode', () => {
      // given
      const targetedCompetence1 = domainBuilder.buildTargetedCompetence({ id: 'recCompetence1', areaId: 'recAreaId', index: '3.1' });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence1] });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        competences: [targetedCompetence1],
        areas: [targetedArea],
      });
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, targetProfile });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].areaCode).to.equal('3');
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
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, targetProfile });
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
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, targetProfile });
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

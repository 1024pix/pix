const CampaignCollectiveResult = require('../../../../lib/domain/read-models/CampaignCollectiveResult');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignCollectiveResult', function () {
  describe('constructor', function () {
    it('should initialize as many CampaignCompetenceCollectiveResult objects as competences in target profile', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recAreaId',
        competences: [
          domainBuilder.buildCompetence({ id: 'recCompetence1', areaId: 'recAreaId' }),
          domainBuilder.buildCompetence({ id: 'recCompetence2', areaId: 'recAreaId' }),
        ],
      });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, campaignLearningContent });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults).to.have.length(2);
    });

    it('should order CampaignCompetenceCollectiveResult by competenceIndex', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recAreaId',
        competences: [
          domainBuilder.buildCompetence({
            id: 'recCompetence1',
            index: '3.1',
            areaId: 'recAreaId',
          }),
          domainBuilder.buildCompetence({
            id: 'recCompetence2',
            index: '1.1',
            areaId: 'recAreaId',
          }),
        ],
      });

      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, campaignLearningContent });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].competenceId).to.equal('recCompetence2');
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[1].competenceId).to.equal('recCompetence1');
    });

    it('should initialize CampaignCompetenceCollectiveResult with a computed id', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recAreaId',
        competences: [
          domainBuilder.buildCompetence({
            id: 'recCompetence1',
            index: '3.1',
            areaId: 'recAreaId',
          }),
        ],
      });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, campaignLearningContent });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].id).to.equal('123_recCompetence1');
    });

    it('should initialize CampaignCompetenceCollectiveResult with a computed areaCode', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recAreaId',
        competences: [
          domainBuilder.buildCompetence({
            id: 'recCompetence1',
            index: '3.1',
            areaId: 'recAreaId',
          }),
        ],
      });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, campaignLearningContent });

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].areaCode).to.equal('3');
    });
  });

  describe('addValidatedSkillCountToCompetences()', function () {
    it('should add up to obtain expected averageValidatedSkills when finalizing on appropriate competence', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recAreaId',
        competences: [
          domainBuilder.buildCompetence({
            id: 'recCompetence1',
            index: '1.1',
            areaId: 'recAreaId',
          }),
          domainBuilder.buildCompetence({
            id: 'recCompetence2',
            index: '2.1',
            areaId: 'recAreaId',
          }),
        ],
      });

      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, campaignLearningContent });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ recCompetence1: 5, recCompetence2: 3 });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ recCompetence2: 6 });

      // when
      campaignCollectiveResult.finalize(2);

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].averageValidatedSkills).to.equal(2.5);
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[1].averageValidatedSkills).to.equal(4.5);
    });
  });

  describe('finalize()', function () {
    it('should obtain expected averageValidatedSkills when finalizing on appropriate competence', function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recAreaId',
        competences: [
          domainBuilder.buildCompetence({
            id: 'recCompetence1',
            index: '1.1',
            areaId: 'recAreaId',
          }),
          domainBuilder.buildCompetence({
            id: 'recCompetence2',
            index: '2.1',
            areaId: 'recAreaId',
          }),
        ],
      });

      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
      const campaignCollectiveResult = new CampaignCollectiveResult({ id: 123, campaignLearningContent });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ recCompetence1: 5, recCompetence2: 3 });
      campaignCollectiveResult.addValidatedSkillCountToCompetences({ recCompetence2: 6 });

      // when
      campaignCollectiveResult.finalize(2);

      // then
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[0].averageValidatedSkills).to.equal(2.5);
      expect(campaignCollectiveResult.campaignCompetenceCollectiveResults[1].averageValidatedSkills).to.equal(4.5);
    });
  });
});

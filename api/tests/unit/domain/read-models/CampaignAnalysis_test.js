const CampaignAnalysis = require('../../../../lib/domain/read-models/CampaignAnalysis');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignAnalysis', function() {

  describe('constructor', function() {

    it('should initialize as many CampaignTubeRecommendations objects as competences in target profile', function() {
      // given
      const targetedTube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', competenceId: 'recCompetenceId' });
      const targetedTube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', competenceId: 'recCompetenceId' });
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'recCompetenceId', areaId: 'recAreaId', tubes: [targetedTube1, targetedTube2] });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence] });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        tubes: [targetedTube1, targetedTube2],
        competences: [targetedCompetence],
        areas: [targetedArea],
      });

      // when
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 123, targetProfileWithLearningContent, tutorials: [] });

      // then
      expect(campaignAnalysis.campaignTubeRecommendations).to.have.length(2);
    });

    it('should initialize CampaignTubeRecommendation with appropriate properties', function() {
      // given
      const targetedTube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetence', index: '3.1' });
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence', areaId: 'recAreaId', tubes: [targetedTube] });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence] });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        tubes: [targetedTube],
        competences: [targetedCompetence],
        areas: [targetedArea],
      });
      const campaignId = 123;

      // when
      const campaignAnalysis = new CampaignAnalysis({ campaignId, targetProfileWithLearningContent, tutorials: [] });

      // then
      expect(campaignAnalysis.campaignTubeRecommendations[0].id).to.equal('123_recTubeId');
      expect(campaignAnalysis.campaignTubeRecommendations[0].campaignId).to.equal(123);
      expect(campaignAnalysis.campaignTubeRecommendations[0].tubeId).to.equal(targetedTube.id);
      expect(campaignAnalysis.campaignTubeRecommendations[0].competenceId).to.equal(targetedCompetence.id);
      expect(campaignAnalysis.campaignTubeRecommendations[0].competenceName).to.equal(targetedCompetence.name);
      expect(campaignAnalysis.campaignTubeRecommendations[0].tubePracticalTitle).to.equal(targetedTube.practicalTitle);
      expect(campaignAnalysis.campaignTubeRecommendations[0].tubeDescription).to.equal(targetedTube.description);
      expect(campaignAnalysis.campaignTubeRecommendations[0].areaColor).to.equal(targetedArea.color);
      expect(campaignAnalysis.campaignTubeRecommendations[0].maxSkillLevelInTargetProfile).to.equal(targetProfileWithLearningContent.maxSkillDifficulty);
    });

    it('should affect CampaignTubeRecommendation with appropriate unique tutorials', function() {
      // given
      const targetedSkill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', tubeId: 'recTubeId', tutorialIds: ['tutorial2', 'nonexistent'] });
      const targetedSkill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', tubeId: 'recTubeId', tutorialIds: ['tutorial2'] });
      const targetedTube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetence', skills: [targetedSkill1, targetedSkill2] });
      const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence', areaId: 'recAreaId', tubes: [targetedTube] });
      const targetedArea = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [targetedCompetence] });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [targetedSkill1, targetedSkill2],
        tubes: [targetedTube],
        competences: [targetedCompetence],
        areas: [targetedArea],
      });
      const campaignId = 123;
      const tutorial1 = domainBuilder.buildTutorial({ id: 'tutorial1' });
      const tutorial2 = domainBuilder.buildTutorial({ id: 'tutorial2' });
      const tutorials = [tutorial1, tutorial2];

      // when
      const campaignAnalysis = new CampaignAnalysis({ campaignId, targetProfileWithLearningContent, tutorials });

      // then
      expect(campaignAnalysis.campaignTubeRecommendations[0].tutorials).to.deep.equal([tutorial2]);
    });
  });

  describe('Average score computation', function() {

    it('should add up to obtain expected average recommendation score on a tube when finalizing ', function() {
      // given
      const participantCount = 2;
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube],
        competences: [competence],
        areas: [area],
      });
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 123, targetProfileWithLearningContent, tutorials: [], participantCount });
      const firstKnowledgeElementsChunk = { [tube.id]: [{ skillId: 'recSkill1', userId: 1 }] };
      const secondKnowledgeElementsChunk = { [tube.id]: [{ skillId: 'recSkill1', userId: 2 }, { skillId: 'recSkill2', userId: 2 }] };
      campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube: firstKnowledgeElementsChunk });
      campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube: secondKnowledgeElementsChunk });

      // when
      campaignAnalysis.finalize();

      // then
      expect(campaignAnalysis.campaignTubeRecommendations[0].averageScore).to.equal(82.5);
    });

    it('computes average recommendation when some participants does not have knowledge element', function() {
      const participantCount = 2;
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube],
        competences: [competence],
        areas: [area],
      });
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 123, targetProfileWithLearningContent, tutorials: [], participantCount });
      const knowledgeElementsByTube = {
        'recTubeId': [{ skillId: 'recSkill1', userId: 1 }],
      };
      campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });
      campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube: { [tube.id]: [] } });

      // when
      campaignAnalysis.finalize();

      // then
      expect(campaignAnalysis.campaignTubeRecommendations[0].averageScore).to.equal(47.5);
    });

    it('returns null when there is no participant', function() {
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube],
        competences: [competence],
        areas: [area],
      });
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 123, targetProfileWithLearningContent, tutorials: [] });

      // when
      campaignAnalysis.finalize(0);

      // then
      expect(campaignAnalysis.campaignTubeRecommendations[0].averageScore).to.be.null;
    });

    it('returns the difficulty score when there are participant but no knowledge elements', function() {
      const participantCount = 6;
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const skill3 = domainBuilder.buildTargetedSkill({ id: 'recSkill3', name: '@difficulty4', tubeId: 'recTubeId2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTubeId2', competenceId: 'recCompetenceId', practicalTitle: 'TubeName2', skills: [skill3] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube1, tube2] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2, skill3],
        tubes: [tube1, tube2],
        competences: [competence],
        areas: [area],
      });
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 123, targetProfileWithLearningContent, tutorials: [], participantCount });

      // when
      campaignAnalysis.finalize();

      // then
      expect(campaignAnalysis.campaignTubeRecommendations[0].averageScore).to.equal(15);
    });

    it('should work for all the tubes', function() {
      const participantCount = 2;
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTubeId1', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTubeId2', competenceId: 'recCompetenceId', practicalTitle: 'TubeName2', skills: [skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube1, tube2] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube1, tube2],
        competences: [competence],
        areas: [area],
      });
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 123, targetProfileWithLearningContent, tutorials: [], participantCount });
      const knowledgeElementsByTube = {
        'recTubeId1': [{ skillId: 'recSkill1', userId: 1 }],
        'recTubeId2': [{ skillId: 'recSkill2', userId: 2 }, { skillId: 'recSkill2', userId: 1 }],
      };
      campaignAnalysis.addToTubeRecommendations({ knowledgeElementsByTube });

      // when
      campaignAnalysis.finalize();

      // then
      expect(campaignAnalysis.campaignTubeRecommendations[0].averageScore).to.equal(50);
      expect(campaignAnalysis.campaignTubeRecommendations[1].averageScore).to.equal(100);
    });
  });
});

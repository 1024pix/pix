const CampaignAnalysis = require('../../../../lib/domain/models/CampaignAnalysis');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Integration | Domain | Models | CampaignAnalysis', () => {

  describe('id', () => {
    it('returns the campaignId', () => {
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 12, targetProfile, validatedKnowledgeElementsByTube: {}, participantsCount: 0  });

      expect(campaignAnalysis.id).to.equal(12);
    });
  });

  describe('campaignTubeRecommendations', () => {
    it('computes a recommendation for each tube', () => {
      const skill1Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill11', name: '@difficulty1', tubeId: 'recTube1' });
      const skill2Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill12', name: '@difficulty2', tubeId: 'recTube1' });
      const skill1Tube2 = domainBuilder.buildTargetedSkill({ id: 'recSkill21', name: '@difficulty3', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', competenceId: 'recCompetence1', practicalTitle: 'TubeName1', skills: [skill1Tube1, skill2Tube1] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', competenceId: 'recCompetence2', practicalTitle: 'TubeName2', skills: [skill1Tube2] });
      const competence1 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName1', id: 'recCompetence1', areaId: 'recArea1', tubes: [tube1] });
      const competence2 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName2', id: 'recCompetence2', areaId: 'recArea2', tubes: [tube2] });
      const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1], color: 'black' });
      const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence2], color: 'black' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1Tube1, skill2Tube1, skill1Tube2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area1, area2],
      });

      const validatedKnowledgeElementsByTube = {
        'recTube1': [{ skillId: 'recSkill11' }, { skillId: 'recSkill12' }],
        'recTube2': [{ skillId: 'recSkill21' }],
      };

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ targetProfile, validatedKnowledgeElementsByTube, participantsCount  });

      expect(campaignAnalysis.campaignTubeRecommendations).to.have.lengthOf(2);
    });

    it('compute the recommendation for each tube using knowledge element from the right tube skills', () => {
      const skill1Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill11', name: '@difficulty1', tubeId: 'recTube1' });
      const skill2Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill12', name: '@difficulty2', tubeId: 'recTube1' });
      const skill1Tube2 = domainBuilder.buildTargetedSkill({ id: 'recSkill21', name: '@difficulty1', tubeId: 'recTube2' });
      const skill2Tube2 = domainBuilder.buildTargetedSkill({ id: 'recSkill22', name: '@difficulty5', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', competenceId: 'recCompetence1', practicalTitle: 'TubeName1', skills: [skill1Tube1, skill2Tube1] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', competenceId: 'recCompetence2', practicalTitle: 'TubeName2', skills: [skill1Tube2, skill2Tube2] });
      const competence1 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName1', id: 'recCompetence1', areaId: 'recArea1', tubes: [tube1] });
      const competence2 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName2', id: 'recCompetence2', areaId: 'recArea2', tubes: [tube2] });
      const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1], color: 'black' });
      const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence2], color: 'black' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1Tube1, skill2Tube1, skill1Tube2, skill2Tube2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area1, area2],
      });

      const validatedKnowledgeElementsByTube = {
        'recTube1': [{ skillId: 'recSkill11', userId: 1 }, { skillId: 'recSkill12', userId: 1 }],
        'recTube2': [{ skillId: 'recSkill21', userId: 1 }],
      };

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ targetProfile, validatedKnowledgeElementsByTube, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'recTube1');
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'recTube2');

      expect(tube1Recommendation.averageScore).to.equal(82);
      expect(tube2Recommendation.averageScore).to.equal(50);
    });

    it('compute a recommendation for each tube using the right tube', () => {
      const skill1Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill11', name: '@difficulty1', tubeId: 'recTube1' });
      const skill1Tube2 = domainBuilder.buildTargetedSkill({ id: 'recSkill21', name: '@difficulty1', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', competenceId: 'recCompetence1', practicalTitle: 'TubeName1', skills: [skill1Tube1] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', competenceId: 'recCompetence2', practicalTitle: 'TubeName2', skills: [skill1Tube2] });
      const competence1 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName1', id: 'recCompetence1', areaId: 'recArea1', tubes: [tube1] });
      const competence2 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName2', id: 'recCompetence2', areaId: 'recArea2', tubes: [tube2] });
      const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1], color: 'black' });
      const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence2], color: 'black' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1Tube1, skill1Tube2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area1, area2],
      });

      const validatedKnowledgeElementsByTube = {
        'recTube1': [],
        'recTube2': [],
      };

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ targetProfile, validatedKnowledgeElementsByTube, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'recTube1');
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'recTube2');

      expect(tube1Recommendation.tubePracticalTitle).to.equal('TubeName1');
      expect(tube2Recommendation.tubePracticalTitle).to.equal('TubeName2');
    });

    it('compute a recommendation for each tube using the right competence', () => {
      const skill1Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill11', name: '@difficulty1', tubeId: 'recTube1' });
      const skill1Tube2 = domainBuilder.buildTargetedSkill({ id: 'recSkill21', name: '@difficulty1', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', competenceId: 'recCompetence1', practicalTitle: 'TubeName1', skills: [skill1Tube1] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', competenceId: 'recCompetence2', practicalTitle: 'TubeName2', skills: [skill1Tube2] });
      const competence1 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName1', id: 'recCompetence1', areaId: 'recArea1', tubes: [tube1] });
      const competence2 = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName2', id: 'recCompetence2', areaId: 'recArea2', tubes: [tube2] });
      const area1 = domainBuilder.buildTargetedArea({ id: 'recArea1', competences: [competence1], color: 'black' });
      const area2 = domainBuilder.buildTargetedArea({ id: 'recArea2', competences: [competence2], color: 'white' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1Tube1, skill1Tube2],
        tubes: [tube1, tube2],
        competences: [competence1, competence2],
        areas: [area1, area2],
      });

      const validatedKnowledgeElementsByTube = {
        'recTube1': [],
        'recTube2': [],
      };

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ targetProfile, validatedKnowledgeElementsByTube, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'recTube1');
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'recTube2');

      expect(tube1Recommendation.competenceId).to.equal('recCompetence1');
      expect(tube1Recommendation.competenceName).to.equal('CompetenceName1');
      expect(tube1Recommendation.areaColor).to.equal('black');

      expect(tube2Recommendation.competenceId).to.equal('recCompetence2');
      expect(tube2Recommendation.competenceName).to.equal('CompetenceName2');
      expect(tube2Recommendation.areaColor).to.equal('white');
    });

    it('compute a recommendation for each tube when participant have the same knowledge elements', () => {
      const skill1Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill11', name: '@difficulty1', tubeId: 'recTube1' });
      const skill2Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill12', name: '@difficulty2', tubeId: 'recTube1' });
      const skill3Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill13', name: '@difficulty3', tubeId: 'recTube1' });
      const skill4Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill14', name: '@difficulty4', tubeId: 'recTube1' });
      const skill5Tube1 = domainBuilder.buildTargetedSkill({ id: 'recSkill15', name: '@difficulty5', tubeId: 'recTube1' });
      const skill1Tube2 = domainBuilder.buildTargetedSkill({ id: 'recSkill21', name: '@difficulty6', tubeId: 'recTube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'recTube1', competenceId: 'recCompetence', practicalTitle: 'TubeName1', skills: [skill1Tube1, skill2Tube1, skill3Tube1, skill4Tube1, skill5Tube1] });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'recTube2', competenceId: 'recCompetence', practicalTitle: 'TubeName2', skills: [skill1Tube2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetence', areaId: 'recArea', tubes: [tube1, tube2] });
      const area = domainBuilder.buildTargetedArea({ id: 'recArea', competences: [competence], color: 'black' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1Tube1, skill2Tube1, skill3Tube1, skill4Tube1, skill5Tube1, skill1Tube2],
        tubes: [tube1, tube2],
        competences: [competence],
        areas: [area],
      });

      const validatedKnowledgeElementsByTube = {
        'recTube1': [{ skillId: 'recSkill11', userId: 1 }, { skillId: 'recSkill12', userId: 1 }, { skillId: 'recSkill13', userId: 1 },
          { skillId: 'recSkill11', userId: 2 }, { skillId: 'recSkill12', userId: 2 }, { skillId: 'recSkill13', userId: 2 },
          { skillId: 'recSkill11', userId: 3 }, { skillId: 'recSkill12', userId: 3 }, { skillId: 'recSkill13', userId: 3 },
          { skillId: 'recSkill11', userId: 4 }, { skillId: 'recSkill12', userId: 4 }, { skillId: 'recSkill13', userId: 4 }],
        'recTube2': [],
      };

      const participantsCount = 4;

      const campaignAnalysis = new CampaignAnalysis({ targetProfile, validatedKnowledgeElementsByTube, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'recTube1');

      expect(tube1Recommendation.averageScore).to.equal(68.5);
    });
  });
});

const CampaignAnalysis = require('../../../../lib/domain/models/CampaignAnalysis');
const { expect } = require('../../../test-helper');

describe('Integration | Domain | Models | CampaignAnalysis', () => {

  describe('id', () => {
    it('returns the campaignId', () => {
      const skills = [{ id: 1, difficulty: 1, tubeId: 1 } ];
      const campaignAnalysis = new CampaignAnalysis({ campaignId: 12, competences: [], tubes: [], skills, validatedKnowledgeElements: [], participantsCount: 0  });

      expect(campaignAnalysis.id).to.equal(12);
    });
  });

  describe('campaignTubeRecommendations', () => {
    it('computes a recommendation for each tube', () => {
      const competences = [
        { id: 1, name: 'Competence1Name', area: { color: 'black' } },
        { id: 2, name: 'Competence2Name', area: { color: 'white' } }
      ];

      const tubes = [
        { id: 1, competenceId: 1 },
        { id: 2, competenceId: 2 }
      ];

      const skills = [
        { id: 1, difficulty: 1, tubeId: 1 },
        { id: 2, difficulty: 2, tubeId: 1 },
        { id: 3, difficulty: 3, tubeId: 2 }
      ];

      const validatedKnowledgeElements = [
        { skillId: 1 },
        { skillId: 2 },
        { skillId: 3 }
      ];

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ competences, tubes, skills, validatedKnowledgeElements, participantsCount  });

      expect(campaignAnalysis.campaignTubeRecommendations).to.have.lengthOf(2);
    });

    it('compute the recommendation for each tube using knowledge element from the right tube skills', () => {
      const tubes = [
        { id: 1, competenceId: 1 },
        { id: 2, competenceId: 2 }
      ];

      const competences = [
        { id: 1, name: 'Competence1Name', area: { color: 'black' } },
        { id: 2, name: 'Competence2Name', area: { color: 'white' } }
      ];

      const skills = [
        { id: 1, difficulty: 1, tubeId: 1 },
        { id: 2, difficulty: 2, tubeId: 1 },
        { id: 3, difficulty: 1, tubeId: 2 },
        { id: 4, difficulty: 5, tubeId: 2 }
      ];

      const validatedKnowledgeElements = [
        { skillId: 1, userId: 1 },
        { skillId: 2, userId: 1 },
        { skillId: 3, userId: 1 }
      ];

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ competences, tubes, skills, validatedKnowledgeElements, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 1);
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 2);

      expect(tube1Recommendation.averageScore).to.equal(82);
      expect(tube2Recommendation.averageScore).to.equal(50);
    });

    it('compute a recommendation for each tube using the right tube', () => {
      const competences = [
        { id: 1, name: 'Competence1Name', area: { color: 'black' } },
        { id: 2, name: 'Competence2Name', area: { color: 'white' } }
      ];

      const tubes = [
        { id: 1, competenceId: 1, practicalTitle: 'Tube1Name' },
        { id: 2, competenceId: 2, practicalTitle: 'Tube2Name' }
      ];

      const skills = [
        { id: 1, difficulty: 1, tubeId: 1 },
        { id: 1, difficulty: 1, tubeId: 2 },
      ];

      const validatedKnowledgeElements = [];

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ competences, tubes, skills, validatedKnowledgeElements, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 1);
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 2);

      expect(tube1Recommendation.tubePracticalTitle).to.equal('Tube1Name');
      expect(tube2Recommendation.tubePracticalTitle).to.equal('Tube2Name');
    });

    it('compute a recommendation for each tube using the right competence', () => {
      const tubes = [
        { id: 1, competenceId: 1 },
        { id: 2, competenceId: 2 }
      ];

      const competences = [
        { id: 1, name: 'Competence1Name', area: { color: 'black' } },
        { id: 2, name: 'Competence2Name', area: { color: 'white' } }
      ];

      const skills = [
        { id: 1, difficulty: 1, tubeId: 1 },
        { id: 1, difficulty: 1, tubeId: 2 },
      ];

      const validatedKnowledgeElements = [];

      const participantsCount = 1;

      const campaignAnalysis = new CampaignAnalysis({ competences, tubes, skills, validatedKnowledgeElements, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 1);
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 2);

      expect(tube1Recommendation.competenceId).to.equal(1);
      expect(tube1Recommendation.competenceName).to.equal('Competence1Name');
      expect(tube1Recommendation.areaColor).to.equal('black');

      expect(tube2Recommendation.competenceId).to.equal(2);
      expect(tube2Recommendation.competenceName).to.equal('Competence2Name');
      expect(tube2Recommendation.areaColor).to.equal('white');
    });

    it('compute a recommendation for each tube when participant have the same knowledge elements', () => {
      const tubes = [
        { id: 1, competenceId: 1 },
        { id: 2, competenceId: 1 },
      ];

      const competences = [
        { id: 1, name: 'Competence1Name', area: { color: 'black' } },
      ];

      const skills = [
        { id: 1, difficulty: 1, tubeId: 1 },
        { id: 2, difficulty: 2, tubeId: 1 },
        { id: 3, difficulty: 3, tubeId: 1 },
        { id: 4, difficulty: 4, tubeId: 1 },
        { id: 5, difficulty: 5, tubeId: 1 },
        { id: 6, difficulty: 6, tubeId: 2 },
      ];

      const validatedKnowledgeElements = [
        { skillId: 1, userId: 1 },
        { skillId: 2, userId: 1 },
        { skillId: 3, userId: 1 },
        { skillId: 1, userId: 2 },
        { skillId: 2, userId: 2 },
        { skillId: 3, userId: 2 },
        { skillId: 1, userId: 3 },
        { skillId: 2, userId: 3 },
        { skillId: 3, userId: 3 },
        { skillId: 1, userId: 4 },
        { skillId: 2, userId: 4 },
        { skillId: 3, userId: 4 }
      ];

      const participantsCount = 4;

      const campaignAnalysis = new CampaignAnalysis({ competences, tubes, skills, validatedKnowledgeElements, participantsCount });
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;

      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 1);

      expect(tube1Recommendation.averageScore).to.equal(68.5);

    });
  });
});

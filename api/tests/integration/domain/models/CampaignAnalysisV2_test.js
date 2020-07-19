const CampaignAnalysisV2 = require('../../../../lib/domain/models/CampaignAnalysisV2');
const { expect } = require('../../../test-helper');

describe('Integration | Domain | Models | CampaignAnalysisV2', () => {

  describe('constructor', () => {
    it('should build a CampaignTubeRecommendationV2 object for each tube', () => {
      // given
      const competences = [
        { id: 'competence1', name: 'Competence1Name', area: { color: 'black' } },
        { id: 'competence2', name: 'Competence2Name', area: { color: 'white' } }
      ];

      const tubes = [
        { id: 'tube1', competenceId: 'competence1', practicalTitle: 'Tube1Name' },
        { id: 'tube2', competenceId: 'competence2', practicalTitle: 'Tube2Name' }
      ];

      const skills = [
        { id: 'skillId1', difficulty: 1, tubeId: 'tube1' },
        { id: 'skillId2', difficulty: 2, tubeId: 'tube1' },
        { id: 'skillId3', difficulty: 3, tubeId: 'tube2' }
      ];

      // when
      const campaignAnalysis = new CampaignAnalysisV2({ competences, tubes, skills });

      // then
      expect(campaignAnalysis.campaignTubeRecommendations).to.have.lengthOf(2);
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;
      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'tube1');
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'tube2');
      expect(tube1Recommendation.tubePracticalTitle).to.equal('Tube1Name');
      expect(tube2Recommendation.tubePracticalTitle).to.equal('Tube2Name');
      expect(tube1Recommendation.competenceId).to.equal('competence1');
      expect(tube1Recommendation.competenceName).to.equal('Competence1Name');
      expect(tube1Recommendation.areaColor).to.equal('black');
      expect(tube2Recommendation.competenceId).to.equal('competence2');
      expect(tube2Recommendation.competenceName).to.equal('Competence2Name');
      expect(tube2Recommendation.areaColor).to.equal('white');
    });
  });

  describe('id', () => {
    it('returns the campaignId', () => {
      const skills = [{ id: 1, difficulty: 1, tubeId: 1 } ];
      const campaignAnalysis = new CampaignAnalysisV2({ campaignId: 12, competences: [], tubes: [], skills, });

      expect(campaignAnalysis.id).to.equal(12);
    });
  });

  describe('#updateCampaignTubeRecommendations', () => {
    it('should update the recommendation for each tube using knowledge element from the right tube skills', () => {
      // given
      const tubes = [
        { id: 'tube1', competenceId: 'competence1' },
        { id: 'tube2', competenceId: 'competence2' }
      ];
      const competences = [
        { id: 'competence1', name: 'Competence1Name', area: { color: 'black' } },
        { id: 'competence2', name: 'Competence2Name', area: { color: 'white' } }
      ];
      const skills = [
        { id: 'skillId1', difficulty: 1, tubeId: 'tube1' },
        { id: 'skillId2', difficulty: 2, tubeId: 'tube1' },
        { id: 'skillId3', difficulty: 1, tubeId: 'tube2' },
        { id: 'skillId4', difficulty: 5, tubeId: 'tube2' }
      ];
      const campaignAnalysis = new CampaignAnalysisV2({ competences, tubes, skills });
      const validatedKnowledgeElementsByParticipantByCompetence = {
        1: { 'competence1': [{ skillId: 'skillId1' }, { skillId: 'skillId2' }], 'competence2': [{ skillId: 'skillId3' }] },
      };

      // when
      campaignAnalysis.updateCampaignTubeRecommendations(validatedKnowledgeElementsByParticipantByCompetence);

      // then
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;
      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'tube1');
      const tube2Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'tube2');
      expect(tube1Recommendation.averageScore).to.equal(82);
      expect(tube2Recommendation.averageScore).to.equal(50);
    });

    it('compute a recommendation for each tube when participant have the same knowledge elements', () => {
      // given
      const tubes = [
        { id: 'tube1', competenceId: 'competence1' },
        { id: 'tube2', competenceId: 'competence1' }
      ];
      const competences = [
        { id: 'competence1', name: 'Competence1Name', area: { color: 'black' } },
      ];
      const skills = [
        { id: 'skillId1', difficulty: 1, tubeId: 'tube1' },
        { id: 'skillId2', difficulty: 2, tubeId: 'tube1' },
        { id: 'skillId3', difficulty: 3, tubeId: 'tube1' },
        { id: 'skillId4', difficulty: 4, tubeId: 'tube1' },
        { id: 'skillId5', difficulty: 5, tubeId: 'tube1' },
        { id: 'skillId6', difficulty: 6, tubeId: 'tube2' },
      ];
      const campaignAnalysis = new CampaignAnalysisV2({ competences, tubes, skills });
      const validatedKnowledgeElementsByParticipantByCompetence = {
        1: { 'competence1': [{ skillId: 'skillId1' }, { skillId: 'skillId2' }, { skillId: 'skillId3' }] },
        2: { 'competence1': [{ skillId: 'skillId1' }, { skillId: 'skillId2' }, { skillId: 'skillId3' }] },
        3: { 'competence1': [{ skillId: 'skillId1' }, { skillId: 'skillId2' }, { skillId: 'skillId3' }] },
        4: { 'competence1': [{ skillId: 'skillId1' }, { skillId: 'skillId2' }, { skillId: 'skillId3' }] },
      };

      // when
      campaignAnalysis.updateCampaignTubeRecommendations(validatedKnowledgeElementsByParticipantByCompetence);

      // then
      const campaignTubeRecommendations = campaignAnalysis.campaignTubeRecommendations;
      const tube1Recommendation = campaignTubeRecommendations.find(({ tubeId }) => tubeId === 'tube1');
      expect(tube1Recommendation.averageScore).to.equal(68.5);

    });
  });
});

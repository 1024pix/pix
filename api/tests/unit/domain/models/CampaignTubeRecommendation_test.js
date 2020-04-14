const CampaignTubeRecommendation = require('../../../../lib/domain/models/CampaignTubeRecommendation');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | CampaignTubeRecommendation', () => {

  describe('tube Info', () => {
    it('sets information about tube', () => {
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 12, competenceId: 1, practicalTitle: 'TubeName' };
      const skills = [{ id: 1, difficulty: 1, tubeId: 1 }];

      const validatedKnowledgeElements = [];

      const campaignTubeRecommendation = new CampaignTubeRecommendation({ competence, tube, skills, validatedKnowledgeElements });

      expect(campaignTubeRecommendation.tubeId).to.equal(12);
      expect(campaignTubeRecommendation.tubePracticalTitle).to.equal('TubeName');
    });
  });

  describe('competence info', () => {
    it('sets information about competence', () => {
      const competence = { id: 3, name: 'CompetenceName', area: { color: 'Blue' } };
      const tube = { id: 1, competenceId: 1, practicalTitle: 'TubeName' };
      const skills = [{ id: 1, difficulty: 1, tubeId: 1 }];

      const validatedKnowledgeElements = [];

      const campaignTubeRecommendation = new CampaignTubeRecommendation({ competence, tube, skills, validatedKnowledgeElements });

      expect(campaignTubeRecommendation.competenceId).to.equal(3);
      expect(campaignTubeRecommendation.competenceName).to.equal('CompetenceName');
    });
  });

  describe('@id', () => {

    it('should return a unique identifier that is the concatenation of "campaignId" and "tubeId"', () => {
      // given
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 'recTube', competenceId: 1, practicalTitle: 'tube' };
      const skills = [{ id: 1, difficulty: 1, tubeId: 1 }];
      const validatedKnowledgeElements = [];
      const campaignId = 123;
      const campaignTubeRecommendation = new CampaignTubeRecommendation({ campaignId, competence, tube, skills, validatedKnowledgeElements });

      // when
      const campaignTubeRecommendationId = campaignTubeRecommendation.id;

      // then
      expect(campaignTubeRecommendationId).to.equal('123_recTube');
    });
  });

  describe('averageScore', () => {
    it('computes the average recommendation of participants', () => {
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 1, competenceId: 1, practicalTitle: 'tube' };
      const participantsCount = 2;

      const skills = [
        { id: 1, difficulty: 1 },
        { id: 2, difficulty: 2 },
      ];

      const validatedKnowledgeElements = [
        { skillId: 1, userId: 1 },
        { skillId: 1, userId: 2 },
        { skillId: 2, userId: 2 },
      ];

      const maxSkillLevelInTargetProfile = 2;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        skills,
        validatedKnowledgeElements,
        participantsCount,
        maxSkillLevelInTargetProfile,
        competence,
        tube
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(82.5);
    });

    it('computes average recommendation when some participants does not have knowledge element', () => {
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 1, competenceId: 1, practicalTitle: 'tube' };
      const participantsCount = 2;

      const skills = [
        { id: 1, difficulty: 1 },
        { id: 2, difficulty: 2 },
      ];

      const validatedKnowledgeElements = [
        { skillId: 1, userId: 1 },
      ];

      const maxSkillLevelInTargetProfile = 2;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        skills,
        validatedKnowledgeElements,
        participantsCount,
        maxSkillLevelInTargetProfile,
        competence,
        tube
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(47.5);
    });

    it('returns null when there is no participant', () => {
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 1, competenceId: 1, practicalTitle: 'tube' };
      const participantsCount = 0;

      const skills = [
        { id: 1, difficulty: 1 },
        { id: 2, difficulty: 2 },
      ];

      const maxSkillLevelInTargetProfile = 2;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        skills,
        participantsCount,
        validatedKnowledgeElements: [],
        maxSkillLevelInTargetProfile,
        competence,
        tube
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(null);
    });

    it('returns the difficulty score when there are participant but no knowledge elements', () => {
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 1, competenceId: 1, practicalTitle: 'tube' };
      const participantsCount = 2;

      const skills = [
        { id: 1, difficulty: 1 },
        { id: 2, difficulty: 2 },
      ];

      const maxSkillLevelInTargetProfile = 4;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        skills,
        participantsCount,
        validatedKnowledgeElements: [],
        maxSkillLevelInTargetProfile,
        competence,
        tube
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(15);
    });
  });
});

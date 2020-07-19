const CampaignTubeRecommendationV2 = require('../../../../lib/domain/models/CampaignTubeRecommendationV2');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | CampaignTubeRecommendationV2', () => {

  describe('tube Info', () => {
    it('sets information about tube', () => {
      // given
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 12, competenceId: 1, practicalTitle: 'TubeName' };
      const skills = [{ id: 1, difficulty: 1, tubeId: 1 }];

      // when
      const campaignTubeRecommendation = new CampaignTubeRecommendationV2({ competence, tube, skills });

      // then
      expect(campaignTubeRecommendation.tubeId).to.equal(12);
      expect(campaignTubeRecommendation.tubePracticalTitle).to.equal('TubeName');
    });
  });

  describe('competence info', () => {
    it('sets information about competence', () => {
      // given
      const competence = { id: 3, name: 'CompetenceName', area: { color: 'Blue' } };
      const tube = { id: 1, competenceId: 1, practicalTitle: 'TubeName' };
      const skills = [{ id: 1, difficulty: 1, tubeId: 1 }];

      // when
      const campaignTubeRecommendation = new CampaignTubeRecommendationV2({ competence, tube, skills });

      // then
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
      const campaignId = 123;
      const campaignTubeRecommendation = new CampaignTubeRecommendationV2({ campaignId, competence, tube, skills });

      // when
      const campaignTubeRecommendationId = campaignTubeRecommendation.id;

      // then
      expect(campaignTubeRecommendationId).to.equal('123_recTube');
    });
  });

  describe('#updateAverageScore', () => {
    let campaignTubeRecommendation;

    beforeEach(() => {
      const competence = { id: 1, name: 'name', area: { color: 'black' } };
      const tube = { id: 1, competenceId: 1, practicalTitle: 'tube' };
      const skills = [
        { id: 1, difficulty: 1 },
        { id: 2, difficulty: 2 },
      ];
      const maxSkillLevelInTargetProfile = 2;
      campaignTubeRecommendation =  new CampaignTubeRecommendationV2({
        skills,
        maxSkillLevelInTargetProfile,
        competence,
        tube
      });
    });

    context('when called for the first time', () => {
      it('computes the average recommendation of participants', () => {
        // given
        const validatedKnowledgeElementsByParticipant = {
          1: [{ skillId: 1 }],
          2: [{ skillId: 1 }, { skillId: 2 }],
        };

        // when
        campaignTubeRecommendation.updateAverageScore(validatedKnowledgeElementsByParticipant);

        // then
        expect(campaignTubeRecommendation.averageScore).to.equal(82.5);
      });

      it('computes average recommendation when some participants does not have knowledge element', () => {
        // given
        const validatedKnowledgeElementsByParticipant = {
          1: [{ skillId: 1 }],
          2: [],
        };

        // when
        campaignTubeRecommendation.updateAverageScore(validatedKnowledgeElementsByParticipant);

        // then
        expect(campaignTubeRecommendation.averageScore).to.equal(47.5);
      });

      it('returns null when there is no participant', () => {
        // when
        campaignTubeRecommendation.updateAverageScore({});

        // then
        expect(campaignTubeRecommendation.averageScore).to.equal(null);
      });

      it('returns the difficulty score when there are participant but no knowledge elements', () => {
        // given
        campaignTubeRecommendation.maxSkillLevelInTargetProfile = 4;
        const validatedKnowledgeElementsByParticipant = {
          1: [],
          2: [],
        };

        // when
        campaignTubeRecommendation.updateAverageScore(validatedKnowledgeElementsByParticipant);

        // then
        expect(campaignTubeRecommendation.averageScore).to.equal(15);
      });
    });

    context('when called again', () => {

      beforeEach(() => {
        const validatedKnowledgeElementsByParticipant = {
          1: [{ skillId: 1 }],
          2: [{ skillId: 1 }, { skillId: 2 }],
        };
        campaignTubeRecommendation.updateAverageScore(validatedKnowledgeElementsByParticipant);
      });

      it('updates the average score recommendation', () => {
        // given
        const moreValidatedKnowledgeElementsByParticipant = {
          3: [{ skillId: 1 }],
          4: [{ skillId: 1 }, { skillId: 2 }],
        };

        // when
        campaignTubeRecommendation.updateAverageScore(moreValidatedKnowledgeElementsByParticipant);

        // then
        expect(campaignTubeRecommendation.averageScore).to.equal(82.5);
      });
    });
  });
});

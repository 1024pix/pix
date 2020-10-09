const CampaignTubeRecommendation = require('../../../../lib/domain/models/CampaignTubeRecommendation');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CampaignTubeRecommendation', () => {

  describe('tube Info', () => {
    it('sets information about tube', () => {
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName' });
      const competence = domainBuilder.buildTargetedCompetence({ id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence] });
      const validatedKnowledgeElements = [];

      const campaignTubeRecommendation = new CampaignTubeRecommendation({ area, competence, tube, validatedKnowledgeElements });

      expect(campaignTubeRecommendation.tubeId).to.equal('recTubeId');
      expect(campaignTubeRecommendation.tubePracticalTitle).to.equal('TubeName');
    });
  });

  describe('competence info', () => {
    it('sets information about competence', () => {
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName' });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence] });
      const validatedKnowledgeElements = [];

      const campaignTubeRecommendation = new CampaignTubeRecommendation({ area, competence, tube, validatedKnowledgeElements });

      expect(campaignTubeRecommendation.competenceId).to.equal('recCompetenceId');
      expect(campaignTubeRecommendation.competenceName).to.equal('CompetenceName');
    });
  });

  describe('@id', () => {
    it('should return a unique identifier that is the concatenation of "campaignId" and "tubeId"', () => {
      // given
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName' });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence] });
      const validatedKnowledgeElements = [];
      const campaignTubeRecommendation = new CampaignTubeRecommendation({ campaignId: 123, area, competence, tube, validatedKnowledgeElements });

      // when
      const campaignTubeRecommendationId = campaignTubeRecommendation.id;

      // then
      expect(campaignTubeRecommendationId).to.equal('123_recTubeId');
    });
  });

  describe('averageScore', () => {
    it('computes the average recommendation of participants', () => {
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const participantsCount = 2;
      const validatedKnowledgeElements = [
        { skillId: 'recSkill1', userId: 1 },
        { skillId: 'recSkill1', userId: 2 },
        { skillId: 'recSkill2', userId: 2 },
      ];
      const maxSkillLevelInTargetProfile = 2;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        area,
        validatedKnowledgeElements,
        participantsCount,
        maxSkillLevelInTargetProfile,
        competence,
        tube,
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(82.5);
    });

    it('computes average recommendation when some participants does not have knowledge element', () => {
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const participantsCount = 2;
      const validatedKnowledgeElements = [
        { skillId: 'recSkill1', userId: 1 },
      ];

      const maxSkillLevelInTargetProfile = 2;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        area,
        validatedKnowledgeElements,
        participantsCount,
        maxSkillLevelInTargetProfile,
        competence,
        tube,
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(47.5);
    });

    it('returns null when there is no participant', () => {
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const maxSkillLevelInTargetProfile = 2;
      const participantsCount = 0;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        area,
        participantsCount,
        validatedKnowledgeElements: [],
        maxSkillLevelInTargetProfile,
        competence,
        tube,
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(null);
    });

    it('returns the difficulty score when there are participant but no knowledge elements', () => {      const skill1 = domainBuilder.buildTargetedSkill({ id: 'recSkill1', name: '@difficulty1', tubeId: 'recTubeId' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'recSkill2', name: '@difficulty2', tubeId: 'recTubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'recTubeId', competenceId: 'recCompetenceId', practicalTitle: 'TubeName', skills: [skill1, skill2] });
      const competence = domainBuilder.buildTargetedCompetence({ name: 'CompetenceName', id: 'recCompetenceId', areaId: 'recAreaId', tubes: [tube] });
      const area = domainBuilder.buildTargetedArea({ id: 'recAreaId', competences: [competence], color: 'black' });
      const maxSkillLevelInTargetProfile = 4;
      const participantsCount = 2;

      const campaignTubeRecommendation = new CampaignTubeRecommendation({
        area,
        participantsCount,
        validatedKnowledgeElements: [],
        maxSkillLevelInTargetProfile,
        competence,
        tube,
      });

      expect(campaignTubeRecommendation.averageScore).to.equal(15);
    });
  });
});

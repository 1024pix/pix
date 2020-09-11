const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentParticipationCompetenceResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationCompetenceResult');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | Domain | Models | CampaignAssessmentParticipationCompetenceResult', () => {

  describe('constructor', () => {
    it('should correctly initialize the competence data', () => {
      const competence = domainBuilder.buildCompetence({
        id: 'rec123',
        name: 'competence1',
        index: '1.1',
      });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        competence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.id).equal('rec123');
      expect(campaignAssessmentParticipationCompetenceResult.name).equal('competence1');
      expect(campaignAssessmentParticipationCompetenceResult.index).equal('1.1');
    });

    it('should return the area color', () => {
      const competence = domainBuilder.buildCompetence({
        area: domainBuilder.buildArea({ color: 'red' }),
      });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        competence,
      });

      expect(campaignAssessmentParticipationCompetenceResult.areaColor).equal('red');
    });

    it('should compute competence total skills count', () => {
      const targetedSkillIds = ['2', '4'];

      const competence = domainBuilder.buildCompetence({
        skillIds: ['1', '2', '3'],
      });

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        competence,
        targetedSkillIds,
      });

      expect(campaignAssessmentParticipationCompetenceResult.totalSkillsCount).equal(1);
    });

    it('should compute validated skills count', () => {
      const competence = domainBuilder.buildCompetence();

      const knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ skillId: '1', competenceId: competence.id }),
        domainBuilder.buildKnowledgeElement({ skillId: '2', competenceId: competence.id }),
        domainBuilder.buildKnowledgeElement({ skillId: '3', status: KnowledgeElement.StatusType.INVALIDATED, competenceId: competence.id }),
      ];

      const campaignAssessmentParticipationCompetenceResult = new CampaignAssessmentParticipationCompetenceResult({
        competence,
        knowledgeElements,
      });

      expect(campaignAssessmentParticipationCompetenceResult.validatedSkillsCount).equal(2);
    });
  });
});

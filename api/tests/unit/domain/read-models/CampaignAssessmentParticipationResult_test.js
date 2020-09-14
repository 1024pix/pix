const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');

describe('Unit | Domain | Models | CampaignAssessmentParticipationResult', () => {
  describe('constructor', () => {
    it('should correctly initialize the information about campaign participation', () => {
      const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        campaignParticipationId: 1,
        campaignId: 2,
        competences: [],
      });

      expect(campaignAssessmentParticipationResult.campaignParticipationId).equal(1);
      expect(campaignAssessmentParticipationResult.campaignId).equal(2);
    });

    context('when the campaignParticipation is not shared', () => {
      it('does not compute CampaignAssessmentParticipationCompetenceResult', () => {
        const competences = [
          domainBuilder.buildCompetence({
            skillIds: [1],
          }),
        ];
        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          competences,
          isShared: false,
          targetedSkillIds: [1],
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(false);
        expect(campaignAssessmentParticipationResult.competenceResults).deep.equal([]);
      });
    });

    context('when the campaignParticipation is shared', () => {
      it('should compute results with targeted competences', () => {
        const competences = [
          domainBuilder.buildCompetence({ id: 'recTargeted', skillIds: [1] }),
          domainBuilder.buildCompetence({ id: 'recNotTargeted', skillIds: [2] }),
        ];
        const knowledgeElementsByCompetenceId = {
          recTargeted: [domainBuilder.buildKnowledgeElement({ skillId: 1, competenceId: 'recTargeted' })],
          recNotTargeted: [domainBuilder.buildKnowledgeElement({ skillId: 2, competenceId: 'recNotTargeted' })],
        };

        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          competences,
          isShared: true,
          targetedSkillIds: [1],
          knowledgeElementsByCompetenceId,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).equal(1);
        expect(campaignAssessmentParticipationResult.competenceResults[0].id).equal('recTargeted');
      });
    });
  });
});

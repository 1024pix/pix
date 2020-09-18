const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');

describe('Unit | Domain | Models | CampaignAssessmentParticipationResult', () => {
  describe('constructor', () => {
    it('should correctly initialize the information about campaign participation', () => {
      const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        campaignParticipationId: 1,
        campaignId: 2,
        targetedCompetences: [],
      });

      expect(campaignAssessmentParticipationResult.campaignParticipationId).equal(1);
      expect(campaignAssessmentParticipationResult.campaignId).equal(2);
    });

    context('when the campaignParticipation is not shared', () => {
      it('does not compute CampaignAssessmentParticipationCompetenceResult', () => {
        const targetedCompetences = [
          domainBuilder.buildCompetence({ id: 'competence1' }),
        ];
        const targetedSkill = domainBuilder.buildSkill({ competenceId: 'competence1' });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [targetedSkill] });
        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          targetedCompetences,
          isShared: false,
          targetProfile,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(false);
        expect(campaignAssessmentParticipationResult.competenceResults).deep.equal([]);
      });
    });

    context('when the campaignParticipation is shared', () => {
      it('should compute results with targeted competences', () => {
        const targetedCompetences = [
          domainBuilder.buildCompetence({ id: 'recTargeted', skillIds: [1] }),
        ];
        const targetedSkill = domainBuilder.buildSkill({ competenceId: 'competence1' });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [targetedSkill] });
        const validatedTargetedKnowledgeElementsByCompetenceId = {
          recTargeted: [domainBuilder.buildKnowledgeElement({ skillId: targetedSkill.id, competenceId: 'recTargeted' })],
        };

        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          targetedCompetences,
          isShared: true,
          targetProfile,
          validatedTargetedKnowledgeElementsByCompetenceId,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).equal(1);
        expect(campaignAssessmentParticipationResult.competenceResults[0].id).equal('recTargeted');
      });
    });
  });
});

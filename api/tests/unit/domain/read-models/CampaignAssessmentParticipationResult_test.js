const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');

describe('Unit | Domain | Models | CampaignAssessmentParticipationResult', () => {
  describe('constructor', () => {
    it('should correctly initialize the information about campaign participation', () => {
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent();
      const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        campaignParticipationId: 1,
        campaignId: 2,
        targetedCompetences: [],
        targetProfile,
      });

      expect(campaignAssessmentParticipationResult.campaignParticipationId).equal(1);
      expect(campaignAssessmentParticipationResult.campaignId).equal(2);
    });

    context('when the campaignParticipation is not shared', () => {
      it('does not compute CampaignAssessmentParticipationCompetenceResult', () => {
        const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'competence1', skills: ['oneSkill'] });
        const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [targetedCompetence] });
        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          targetedCompetences: [targetedCompetence],
          isShared: false,
          targetProfile,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(false);
        expect(campaignAssessmentParticipationResult.competenceResults).deep.equal([]);
      });
    });

    context('when the campaignParticipation is shared', () => {
      it('should compute results with targeted competences', () => {
        const targetedCompetence = domainBuilder.buildTargetedCompetence({ id: 'competence1', skills: ['oneSkill'], areaId: 'area1' });
        const targetedArea = domainBuilder.buildTargetedArea({ id: 'area1', competences: [targetedCompetence] });
        const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [targetedCompetence], areas: [targetedArea] });
        const validatedTargetedKnowledgeElementsByCompetenceId = {
          competence1: [domainBuilder.buildKnowledgeElement({ skillId: 'someId', competenceId: 'competence1' })],
        };

        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          targetedCompetences: [targetedCompetence],
          isShared: true,
          validatedTargetedKnowledgeElementsByCompetenceId,
          targetProfile,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).equal(1);
        expect(campaignAssessmentParticipationResult.competenceResults[0].id).equal('1-competence1');
      });
    });
  });
});

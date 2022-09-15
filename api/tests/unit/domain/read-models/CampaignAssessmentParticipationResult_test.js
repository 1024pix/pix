const { expect, domainBuilder } = require('../../../test-helper');
const CampaignAssessmentParticipationResult = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

const { SHARED, TO_SHARE } = CampaignParticipationStatuses;

describe('Unit | Domain | Models | CampaignAssessmentParticipationResult', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about campaign participation', function () {
      const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        campaignParticipationId: 1,
        campaignId: 2,
        competences: [],
      });

      expect(campaignAssessmentParticipationResult.campaignParticipationId).equal(1);
      expect(campaignAssessmentParticipationResult.campaignId).equal(2);
    });

    context('when the campaignParticipation is not shared', function () {
      it('does not compute CampaignAssessmentParticipationCompetenceResult', function () {
        const competence = domainBuilder.buildCompetence({ id: 'competence1', skills: ['oneSkill'] });

        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          competences: [competence],
          status: TO_SHARE,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(false);
        expect(campaignAssessmentParticipationResult.competenceResults).deep.equal([]);
      });
    });

    context('when the campaignParticipation is shared', function () {
      it('should compute results with targeted competences', function () {
        const area = domainBuilder.buildArea({ id: 'area1' });

        const competence = domainBuilder.buildCompetence({
          id: 'competence1',
          skills: ['oneSkill'],
          area,
        });

        const validatedTargetedKnowledgeElementsByCompetenceId = {
          competence1: [domainBuilder.buildKnowledgeElement({ skillId: 'someId', competenceId: 'competence1' })],
        };

        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          competences: [competence],
          status: SHARED,
          validatedTargetedKnowledgeElementsByCompetenceId,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).equal(1);
        expect(campaignAssessmentParticipationResult.competenceResults[0].id).equal('1-competence1');
      });
    });
  });
});

import { expect, domainBuilder } from '../../../test-helper.js';
import { CampaignAssessmentParticipationResult } from '../../../../lib/domain/read-models/CampaignAssessmentParticipationResult.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';

const { SHARED, TO_SHARE } = CampaignParticipationStatuses;

describe('Unit | Domain | Models | CampaignAssessmentParticipationResult', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about campaign participation', function () {
      const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
        campaignParticipationId: 1,
        campaignId: 2,
      });

      expect(campaignAssessmentParticipationResult.campaignParticipationId).equal(1);
      expect(campaignAssessmentParticipationResult.campaignId).equal(2);
    });

    context('when the campaignParticipation is not shared', function () {
      it('does not compute CampaignAssessmentParticipationCompetenceResult', function () {
        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          status: TO_SHARE,
        });

        expect(campaignAssessmentParticipationResult.isShared).equal(false);
        expect(campaignAssessmentParticipationResult.competenceResults).deep.equal([]);
      });
    });

    context('when the campaignParticipation is shared', function () {
      it('should compute results with targeted competences', function () {
        const competence = domainBuilder.buildCompetence({
          id: 'competence1',
          skills: ['oneSkill'],
          areaId: 'area1',
        });
        const area = domainBuilder.buildArea({ id: 'area1', color: 'red', competences: [competence] });
        const framework = domainBuilder.buildFramework({ areas: [area] });
        const learningContent = domainBuilder.buildLearningContent([framework]);
        const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);

        const validatedTargetedKnowledgeElementsByCompetenceId = {
          competence1: [domainBuilder.buildKnowledgeElement({ skillId: 'someId', competenceId: 'competence1' })],
        };

        const campaignAssessmentParticipationResult = new CampaignAssessmentParticipationResult({
          campaignParticipationId: 1,
          campaignId: 2,
          campaignLearningContent,
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

import sinon from 'sinon';

import { usecases as devcompUsecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { assessmentController } from '../../../../../src/evaluation/application/assessments/assessment-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { usecases as prescriptionUsecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { usecases as profileUsecases } from '../../../../../src/profile/domain/usecases/index.js';
import { usecases as questUsecases } from '../../../../../src/quest/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';

describe('Unit | Controller | assessment-controller', function () {
  describe('#completeAssessment', function () {
    let assessmentId, assessment, locale;

    beforeEach(function () {
      assessmentId = 2;
      assessment = {
        userId: null,
        isCampaignParticipationAvailable: sinon.stub().returns(false),
      };
      locale = 'fr-fr';

      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      sinon.stub(evaluationUsecases, 'completeAssessment');
      sinon.stub(evaluationUsecases, 'handleBadgeAcquisition');
      sinon.stub(devcompUsecases, 'handleTrainingRecommendation');
      sinon.stub(evaluationUsecases, 'handleStageAcquisition');
      sinon.stub(questUsecases, 'rewardUser');
      sinon.stub(prescriptionUsecases, 'shareCampaignResult');
      sinon.stub(questUsecases, 'getQuestResultsForCampaignParticipation');
      sinon.stub(profileUsecases, 'shareProfileReward');
      sinon.stub(featureToggles, 'get');
      evaluationUsecases.completeAssessment.resolves(assessment);
      evaluationUsecases.handleBadgeAcquisition.resolves();
      featureToggles.get.resolves(false);
    });

    it('should call the completeAssessment use case', async function () {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(evaluationUsecases.completeAssessment).to.have.been.calledWithExactly({ assessmentId, locale });
    });

    it('should call the handleBadgeAcquisition use case', async function () {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(evaluationUsecases.handleBadgeAcquisition).to.have.been.calledWithExactly({ assessment });
    });

    it('should call the handleTrainingRecommendation use case', async function () {
      // given
      const locale = 'fr-fr';

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(devcompUsecases.handleTrainingRecommendation).to.have.been.calledWithExactly({
        assessment,
        locale,
      });
    });

    context('campaign participation sharing', function () {
      it('should call shareCampaignResult when assessment has campaign participation available', async function () {
        // given
        const userId = 12;
        const campaignParticipationId = 456;
        assessment.userId = userId;
        assessment.campaignParticipationId = campaignParticipationId;
        assessment.isCampaignParticipationAvailable.returns(true);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(prescriptionUsecases.shareCampaignResult).to.have.been.calledWithExactly({
          userId,
          campaignParticipationId,
        });
      });

      it('should not call shareCampaignResult when campaign participation is not available', async function () {
        // given
        assessment.userId = 12;
        assessment.isCampaignParticipationAvailable.returns(false);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(prescriptionUsecases.shareCampaignResult).to.not.have.been.called;
      });

      it('should not call shareCampaignResult when there is no userId', async function () {
        // given
        assessment.userId = null;
        assessment.isCampaignParticipationAvailable.returns(true);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(prescriptionUsecases.shareCampaignResult).to.not.have.been.called;
      });
    });

    context('quest rewards', function () {
      it('should not call the rewardUser usecase if the questEnabled flag is false', async function () {
        // given
        featureToggles.get.resolves(false);
        assessment.userId = 12;
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.rewardUser).to.have.not.been.called;
      });

      it('should call the rewardUser use case if there is a userId and quest is enabled', async function () {
        // given
        featureToggles.get.resolves(true);
        assessment.userId = 12;
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.rewardUser).to.have.been.calledWithExactly({
          userId: 12,
        });
      });

      it('should not call the rewardUser use case if there is no userId', async function () {
        // given
        featureToggles.get.resolves(true);
        assessment.userId = null;
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.rewardUser).to.not.have.been.called;
      });
    });

    context('profile reward sharing', function () {
      it('should share profile reward when campaign participation is available, quest is enabled, and quest result has profileRewardId', async function () {
        // given
        const userId = 12;
        const campaignParticipationId = 456;
        const profileRewardId = 789;
        assessment.userId = userId;
        assessment.campaignParticipationId = campaignParticipationId;
        assessment.isCampaignParticipationAvailable.returns(true);
        featureToggles.get.resolves(true);
        questUsecases.getQuestResultsForCampaignParticipation.resolves([{ profileRewardId }]);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.getQuestResultsForCampaignParticipation).to.have.been.calledWithExactly({
          userId,
          campaignParticipationId,
        });
        expect(profileUsecases.shareProfileReward).to.have.been.calledWithExactly({
          userId,
          profileRewardId,
          campaignParticipationId,
        });
      });

      it('should not share profile reward when quest is disabled', async function () {
        // given
        assessment.userId = 12;
        assessment.campaignParticipationId = 456;
        assessment.isCampaignParticipationAvailable.returns(true);
        featureToggles.get.resolves(false);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.getQuestResultsForCampaignParticipation).to.not.have.been.called;
        expect(profileUsecases.shareProfileReward).to.not.have.been.called;
      });

      it('should not share profile reward when campaign participation is not available', async function () {
        // given
        assessment.userId = 12;
        assessment.isCampaignParticipationAvailable.returns(false);
        featureToggles.get.resolves(true);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.getQuestResultsForCampaignParticipation).to.not.have.been.called;
        expect(profileUsecases.shareProfileReward).to.not.have.been.called;
      });

      it('should not share profile reward when quest result has no profileRewardId', async function () {
        // given
        assessment.userId = 12;
        assessment.campaignParticipationId = 456;
        assessment.isCampaignParticipationAvailable.returns(true);
        featureToggles.get.resolves(true);
        questUsecases.getQuestResultsForCampaignParticipation.resolves([{ profileRewardId: null }]);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.getQuestResultsForCampaignParticipation).to.have.been.called;
        expect(profileUsecases.shareProfileReward).to.not.have.been.called;
      });
    });
  });
});

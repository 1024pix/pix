import { expect } from 'chai';
import sinon from 'sinon';

import { usecases as devcompUsecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { assessmentController } from '../../../../../src/evaluation/application/assessments/assessment-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { usecases as campaignParticipationsUsecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { stageUsecases } from '../../../../../src/prescription/stages/domain/usecases/index.js';
import { usecases as profileUsecases } from '../../../../../src/profile/domain/usecases/index.js';
import { usecases as questUsecases } from '../../../../../src/quest/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Evaluation | Unit | Application | assessment-controller', function () {
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
      sinon.stub(stageUsecases, 'handleStageAcquisition');
      sinon.stub(questUsecases, 'rewardUser');
      sinon.stub(campaignParticipationsUsecases, 'shareCampaignResult');
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
        expect(campaignParticipationsUsecases.shareCampaignResult).to.have.been.calledWithExactly({
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
        expect(campaignParticipationsUsecases.shareCampaignResult).to.not.have.been.called;
      });

      it('should not call shareCampaignResult when there is no userId', async function () {
        // given
        assessment.userId = null;
        assessment.isCampaignParticipationAvailable.returns(true);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(campaignParticipationsUsecases.shareCampaignResult).to.not.have.been.called;
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

      it('should share a profile rewards for each quest results', async function () {
        // given
        const userId = 12;
        const campaignParticipationId = 456;
        const profileRewardId = 789;
        const secondProfileRewardId = 987;
        assessment.userId = userId;
        assessment.campaignParticipationId = campaignParticipationId;
        assessment.isCampaignParticipationAvailable.returns(true);
        featureToggles.get.resolves(true);
        questUsecases.getQuestResultsForCampaignParticipation.resolves([
          { profileRewardId },
          { profileRewardId: secondProfileRewardId },
        ]);
        evaluationUsecases.completeAssessment.resolves(assessment);

        // when
        await assessmentController.completeAssessment({ params: { id: assessmentId } });

        // then
        expect(questUsecases.getQuestResultsForCampaignParticipation).to.have.been.calledWithExactly({
          userId,
          campaignParticipationId,
        });

        expect(profileUsecases.shareProfileReward).calledTwice;
        expect(profileUsecases.shareProfileReward.getCall(0)).to.have.been.calledWithExactly({
          userId,
          profileRewardId,
          campaignParticipationId,
        });
        expect(profileUsecases.shareProfileReward.getCall(1)).to.have.been.calledWithExactly({
          userId,
          profileRewardId: secondProfileRewardId,
          campaignParticipationId,
        });
      });
    });
  });

  describe('#save', function () {
    context('when the assessment saved is a preview test', function () {
      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            attributes: {
              'estimated-level': 4,
              'pix-score': 4,
              type: 'PREVIEW',
            },
            relationships: {
              course: {
                data: {
                  id: 'null-preview-id',
                },
              },
            },
          },
        },
      };

      it('should save an assessment with type PREVIEW', async function () {
        // given
        const assessmentRepositoryStub = { save: sinon.stub() };
        const expected = new Assessment({
          courseId: null,
          type: 'PREVIEW',
          userId: null,
          state: 'started',
          method: 'CHOSEN',
        });
        assessmentRepositoryStub.save.resolves({ id: 42, ...expected });

        // when
        await assessmentController.save(request, hFake, { assessmentRepository: assessmentRepositoryStub });

        // then
        expect(assessmentRepositoryStub.save).to.have.been.calledWithExactly({ assessment: expected });
      });
    });
  });

  describe('#findCompetenceEvaluations', function () {
    it('should return the competence evaluations', async function () {
      // given
      const userId = 123;
      const assessmentId = 456;
      const competenceEvaluation1 = domainBuilder.buildCompetenceEvaluation({ assessmentId, userId });
      const competenceEvaluation2 = domainBuilder.buildCompetenceEvaluation({ assessmentId, userId });
      sinon
        .stub(evaluationUsecases, 'findCompetenceEvaluationsByAssessment')
        .withArgs({ assessmentId, userId })
        .resolves([competenceEvaluation1, competenceEvaluation2]);
      const request = {
        auth: { credentials: { userId } },
        params: {
          id: assessmentId,
        },
      };

      // when
      const result = await assessmentController.findCompetenceEvaluations(request, hFake);

      // then
      expect(result.data).to.be.deep.equal([
        {
          type: 'competence-evaluations',
          id: competenceEvaluation1.id.toString(),
          attributes: {
            'competence-id': competenceEvaluation1.competenceId,
            'user-id': competenceEvaluation1.userId,
            'created-at': competenceEvaluation1.createdAt,
            'updated-at': competenceEvaluation1.updatedAt,
            status: competenceEvaluation1.status,
          },
          relationships: {
            assessment: {
              data: {
                id: assessmentId.toString(),
                type: 'assessments',
              },
            },
            scorecard: {
              links: {
                related: `/api/scorecards/${userId}_${competenceEvaluation1.competenceId}`,
              },
            },
          },
        },
        {
          type: 'competence-evaluations',
          id: competenceEvaluation2.id.toString(),
          attributes: {
            'competence-id': competenceEvaluation2.competenceId,
            'user-id': competenceEvaluation2.userId,
            'created-at': competenceEvaluation2.createdAt,
            'updated-at': competenceEvaluation2.updatedAt,
            status: competenceEvaluation2.status,
          },
          relationships: {
            assessment: {
              data: {
                id: assessmentId.toString(),
                type: 'assessments',
              },
            },
            scorecard: {
              links: {
                related: `/api/scorecards/${userId}_${competenceEvaluation2.competenceId}`,
              },
            },
          },
        },
      ]);
    });
  });
});

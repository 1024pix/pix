import sinon from 'sinon';

import { answerController } from '../../../../../src/evaluation/application/answers/answer-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { usecases as questUsecases } from '../../../../../src/quest/domain/usecases/index.js';
import { config } from '../../../../../src/shared/config.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Controller | answer-controller', function () {
  let answerSerializerStub, certificationEvaluationApiStub;

  beforeEach(function () {
    answerSerializerStub = {
      serialize: sinon.stub(),
      deserialize: sinon.stub(),
    };
    certificationEvaluationApiStub = {
      evaluateAndSaveAnswer: sinon.stub(),
    };
    sinon.stub(questUsecases, 'rewardUser');
  });

  describe('#save', function () {
    const answerId = 1212;
    const assessmentId = 12;
    const userId = 3;
    const challengeId = 'recdTpx4c0kPPDTtf';
    const result = null;
    const timeout = null;
    const focusedOut = false;
    const resultDetails = null;
    const value = 'NumA = "4", NumB = "1", NumC = "3", NumD = "2"';
    const locale = 'fr-fr';

    let request;
    let deserializedAnswer;
    let assessmentRepository;
    const serializedAnswer = {
      data: {
        type: 'answers',
        id: answerId,
        attributes: {
          value: 'NumA = "4", NumB = "1", NumC = "3", NumD = "2"',
          'result-details': 'resultDetails_value',
          timeout: null,
          result: 'result_value',
          'focused-out': focusedOut,
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: assessmentId,
            },
          },
          challenge: {
            data: {
              type: 'challenges',
              id: challengeId,
            },
          },
        },
      },
    };

    beforeEach(function () {
      request = {
        state: { locale },
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
          data: {
            attributes: {
              value: value,
              result: result,
              timeout: timeout,
              'focused-out': focusedOut,
              'result-details': resultDetails,
            },
            relationships: {
              assessment: {
                data: {
                  type: 'assessments',
                  id: assessmentId,
                },
              },
              challenge: {
                data: {
                  type: 'challenges',
                  id: challengeId,
                },
              },
            },
            type: 'answers',
          },
        },
      };
      deserializedAnswer = domainBuilder.buildAnswer({
        result,
        resultDetails,
        timeout,
        value,
        assessmentId,
        challengeId,
        focusedOut,
      });
      assessmentRepository = { getWithAnswers: sinon.stub() };
      deserializedAnswer.id = undefined;
      deserializedAnswer.timeSpent = undefined;
      answerSerializerStub.serialize.returns(serializedAnswer);
      answerSerializerStub.deserialize.returns(deserializedAnswer);
      sinon.stub(evaluationUsecases, 'saveAndCorrectAnswerForCompetenceEvaluation');
      sinon.stub(evaluationUsecases, 'saveAndCorrectAnswerForCampaign');
      sinon.stub(evaluationUsecases, 'saveAndCorrectAnswerForDemoAndPreview');
    });

    context('assessment type', function () {
      let createdAnswer;
      let response;

      it('should call appropriate usecase when assessment is of type COMPETENCE_EVALUATION', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });
        assessmentRepository.getWithAnswers.withArgs(assessmentId).resolves(assessment);

        // when
        response = await answerController.save(request, hFake, {
          answerSerializer: answerSerializerStub,
          assessmentRepository,
        });

        // then
        expect(evaluationUsecases.saveAndCorrectAnswerForCompetenceEvaluation).to.have.been.calledWithExactly({
          answer: deserializedAnswer,
          assessment,
          userId,
          locale,
        });
        expect(answerSerializerStub.serialize).to.have.been.calledWithExactly(createdAnswer);
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });

      it('should call appropriate usecase when assessment is of type CAMPAIGN', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({
          type: Assessment.types.CAMPAIGN,
          campaignParticipationId: 1234,
        });
        assessmentRepository.getWithAnswers.withArgs(assessmentId).resolves(assessment);

        // when
        response = await answerController.save(request, hFake, {
          answerSerializer: answerSerializerStub,
          assessmentRepository,
        });

        // then
        expect(evaluationUsecases.saveAndCorrectAnswerForCampaign).to.have.been.calledWithExactly({
          answer: deserializedAnswer,
          assessment,
          userId,
          locale,
        });
        expect(answerSerializerStub.serialize).to.have.been.calledWithExactly(createdAnswer);
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });

      it('should call appropriate usecase when assessment is of type CERTIFICATION', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({
          type: Assessment.types.CERTIFICATION,
          certificationCourseId: 112233,
        });
        assessmentRepository.getWithAnswers.withArgs(assessmentId).resolves(assessment);

        // when
        response = await answerController.save(request, hFake, {
          answerSerializer: answerSerializerStub,
          assessmentRepository,
          certificationEvaluationApi: certificationEvaluationApiStub,
        });

        // then
        expect(certificationEvaluationApiStub.evaluateAndSaveAnswer).to.have.been.calledWithExactly({
          answer: deserializedAnswer,
          certificationCourseId: 112233,
          userId,
        });
        expect(answerSerializerStub.serialize).to.have.been.calledWithExactly(createdAnswer);
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });

      it('should call appropriate usecase when assessment is of type DEMO', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });
        assessmentRepository.getWithAnswers.withArgs(assessmentId).resolves(assessment);

        // when
        response = await answerController.save(request, hFake, {
          answerSerializer: answerSerializerStub,
          assessmentRepository,
        });

        // then
        expect(evaluationUsecases.saveAndCorrectAnswerForDemoAndPreview).to.have.been.calledWithExactly({
          answer: deserializedAnswer,
          assessment,
          userId,
          locale,
        });
        expect(answerSerializerStub.serialize).to.have.been.calledWithExactly(createdAnswer);
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });

      it('should call appropriate usecase when assessment is of type PREVIEW', async function () {
        // given
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.PREVIEW });
        assessmentRepository.getWithAnswers.withArgs(assessmentId).resolves(assessment);

        // when
        response = await answerController.save(request, hFake, {
          answerSerializer: answerSerializerStub,
          assessmentRepository,
        });

        // then
        expect(evaluationUsecases.saveAndCorrectAnswerForDemoAndPreview).to.have.been.calledWithExactly({
          answer: deserializedAnswer,
          assessment,
          userId,
          locale,
        });
        expect(answerSerializerStub.serialize).to.have.been.calledWithExactly(createdAnswer);
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });
    });

    context('quests', function () {
      beforeEach(function () {
        assessmentRepository.getWithAnswers.resolves(
          domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION }),
        );
        sinon.stub(config, 'featureToggles');
      });

      context('when quest feature is not enabled', function () {
        it('should not call rewardUser', async function () {
          // given
          await featureToggles.set('isQuestEnabled', false);

          // when
          await answerController.save(request, hFake, {
            answerSerializer: answerSerializerStub,
            assessmentRepository,
          });

          // then
          expect(questUsecases.rewardUser).to.have.not.been.called;
        });
      });

      context('when quest feature enabled', function () {
        it('should not call the reward user usecase if userId is not provided', async function () {
          // given
          await featureToggles.set('isQuestEnabled', true);
          // Setting headers so that userId is not provided
          request.headers = {};

          // when
          await answerController.save(request, hFake, {
            answerSerializer: answerSerializerStub,
            assessmentRepository,
          });

          // then
          expect(questUsecases.rewardUser).to.not.have.been.called;
        });
      });
    });
  });

  describe('#getCorrection', function () {
    const answerId = 1;
    const userId = 'userId';
    const locale = 'fr';
    let correctionSerializerStub;

    beforeEach(function () {
      sinon.stub(evaluationUsecases, 'getCorrectionForAnswer');
      correctionSerializerStub = { serialize: sinon.stub() };
    });

    it('should return ok', async function () {
      // given
      evaluationUsecases.getCorrectionForAnswer.withArgs({ answerId, userId, locale }).resolves({});
      correctionSerializerStub.serialize.withArgs({}).returns('ok');

      // when
      const response = await answerController.getCorrection(
        {
          params: { id: answerId },
          state: { locale },
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        },
        hFake,
        { correctionSerializer: correctionSerializerStub },
      );

      // then
      expect(response).to.be.equal('ok');
    });
  });
});

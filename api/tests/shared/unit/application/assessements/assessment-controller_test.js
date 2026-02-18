import { usecases as certificationUsecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { assessmentController } from '../../../../../src/shared/application/assessments/assessment-controller.js';
import { config } from '../../../../../src/shared/config.js';
import { sharedUsecases } from '../../../../../src/shared/domain/usecases/index.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | assessment-controller', function () {
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

  describe('#createCertificationChallengeLiveAlert', function () {
    it('should call the createCertificationChallengeLiveAlert use case', async function () {
      // given
      const assessmentId = 2;
      const challengeId = '123';
      sinon.stub(certificationUsecases, 'createCertificationChallengeLiveAlert');
      certificationUsecases.createCertificationChallengeLiveAlert.resolves();
      const payload = { data: { attributes: { 'challenge-id': challengeId } } };
      const request = { params: { id: assessmentId }, payload };

      // when
      const response = await assessmentController.createCertificationChallengeLiveAlert(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(204);
      expect(certificationUsecases.createCertificationChallengeLiveAlert).to.have.been.calledWithExactly({
        assessmentId,
        challengeId,
      });
    });
  });

  describe('#getAssessmentWithNextChallenge', function () {
    it('should return progression for exam campaign', async function () {
      // given
      const userId = 123;
      const assessmentId = 456;
      const assessment = { campaign: { isExam: true } };
      const progression = { completionRate: 0.75 };
      const dtoStub = sinon.stub();
      const assessmentResult = Symbol('assessment');
      dtoStub.withArgs(progression.completionRate).returns(assessmentResult);
      const assessmentWithChallenge = { toDto: dtoStub };
      const serializedResult = Symbol('serialized-result');
      const extractUserIdFromRequest = sinon.stub().returns(userId);

      sinon.stub(config, 'featureToggles');
      await featureToggles.set('enableTransactionForGetNext', false);

      sinon.stub(sharedUsecases, 'getAssessment').withArgs({ assessmentId, locale: 'fr-fr' }).resolves(assessment);

      sinon
        .stub(evaluationUsecases, 'getProgression')
        .withArgs({ progressionId: assessmentId.toString(), userId })
        .resolves(progression);

      sinon
        .stub(sharedUsecases, 'updateAssessmentWithNextChallenge')
        .withArgs({ assessment, userId, locale: 'fr-fr' })
        .resolves(assessmentWithChallenge);

      const assessmentSerializer = { serialize: sinon.stub() };
      assessmentSerializer.serialize.withArgs(assessmentResult).returns(serializedResult);

      const request = {
        params: {
          id: assessmentId,
        },
      };

      // when
      const result = await assessmentController.getAssessmentWithNextChallenge(request, hFake, {
        assessmentSerializer,
        extractUserIdFromRequest,
      });
      expect(result).equal(serializedResult);
    });
  });
});

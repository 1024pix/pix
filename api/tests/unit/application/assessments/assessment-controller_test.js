const { sinon, expect, hFake, domainBuilder } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');
const events = require('../../../../lib/domain/events/index.js');
const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Unit | Controller | assessment-controller', function () {
  describe('#get', function () {
    const authenticatedUserId = '12';
    const locale = 'fr';
    const assessmentId = 104974;

    const assessment = { id: assessmentId, title: 'Ordinary Wizarding Level assessment' };

    beforeEach(function () {
      sinon.stub(usecases, 'getAssessment').withArgs({ assessmentId, locale }).resolves(assessment);
      sinon.stub(assessmentSerializer, 'serialize').resolvesArg(0);
    });

    it('should call the expected usecase', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            userId: authenticatedUserId,
          },
        },
        params: {
          id: assessmentId,
        },
        headers: { 'accept-language': locale },
      };

      // when
      const result = await assessmentController.get(request, hFake);

      // then
      expect(result).to.be.equal(assessment);
    });
  });

  describe('#completeAssessment', function () {
    let domainTransaction, assessmentId, assessment, assessmentCompletedEvent;

    beforeEach(function () {
      domainTransaction = Symbol('domainTransaction');
      assessmentId = 2;
      assessmentCompletedEvent = new AssessmentCompleted();
      assessment = Symbol('completed-assessment');
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };

      sinon.stub(usecases, 'completeAssessment');
      sinon.stub(usecases, 'handleBadgeAcquisition');
      sinon.stub(usecases, 'handleTrainingRecommendation');
      usecases.completeAssessment.resolves({
        event: assessmentCompletedEvent,
        assessment,
      });
      usecases.handleBadgeAcquisition.resolves();
      sinon.stub(events.eventDispatcher, 'dispatch');
    });

    it('should call the completeAssessment use case', async function () {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(usecases.completeAssessment).to.have.been.calledWithExactly({ assessmentId, domainTransaction });
    });

    it('should call the handleBadgeAcquisition use case', async function () {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(usecases.handleBadgeAcquisition).to.have.been.calledWithExactly({ assessment, domainTransaction });
    });

    it('should call the handleTrainingRecommendation use case', async function () {
      // given
      const locale = 'fr-fr';

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(usecases.handleTrainingRecommendation).to.have.been.calledWithExactly({
        assessment,
        locale,
        domainTransaction,
      });
    });

    it('should dispatch the assessment completed event', async function () {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(assessmentCompletedEvent);
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
        .stub(usecases, 'findCompetenceEvaluationsByAssessment')
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

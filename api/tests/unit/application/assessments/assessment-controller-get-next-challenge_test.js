const {describe, it, beforeEach, afterEach, sinon} = require('../../../test-helper');
const Boom = require('boom');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentService = require('../../../../lib/domain/services/assessment-service');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');

const Assessment = require('../../../../lib/domain/models/data/assessment');

describe('Unit | Controller | assessment-controller', () => {

  describe('#getNextChallenge', () => {

    let sandbox;
    let assessmentWithScore;

    beforeEach(() => {

      assessmentWithScore = new Assessment({
        id: 1,
        courseId: 'recHzEA6lN4PEs7LG', userId: 5,
        estimatedLevel: 0,
        pixScore: 0
      });

      sandbox = sinon.sandbox.create();

      sandbox.stub(assessmentService, 'getScoredAssessment').resolves(assessmentWithScore);
      sandbox.stub(assessmentWithScore, 'save');
      sandbox.stub(assessmentRepository, 'get').resolves({});
      sandbox.stub(assessmentService, 'getAssessmentNextChallengeId');
    });

    afterEach(() => {

      sandbox.restore();

    });

    describe('when the assessment is over', () => {

      beforeEach(() => {
        assessmentService.getAssessmentNextChallengeId.resolves(null);
      });

      it('should call getScoredAssessment', () => {
        // When
        const promise = assessmentController.getNextChallenge({params: {id: 7531}}, () => {
        });

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(assessmentService.getScoredAssessment, 7531);
        });
      });

      it('should save the assessment with score', () => {
        // When
        const promise = assessmentController.getNextChallenge({params: {id: 7531}}, () => {
        });

        // Then
        return promise.then(() => {
          sinon.assert.called(assessmentWithScore.save);
        });
      });

      describe('when saving level and score is failing', () => {

        let badImplementationSpy;
        let replyStub;

        beforeEach(() => {
          badImplementationSpy = sinon.stub(Boom, 'badImplementation').returns({});
          replyStub = sinon.stub();
        });

        afterEach(() => {
          badImplementationSpy.restore();
        });

        it('should return a badImplementation error when evaluating is an error', () => {
          // Given
          const error = new Error('Unable to evaluate level');
          assessmentService.getScoredAssessment.rejects(error);

          // When
          const promise = assessmentController.getNextChallenge({params: {id: 7531}}, replyStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledWith(badImplementationSpy, error);
            sinon.assert.calledWith(replyStub, Boom.badImplementation(error));
          });
        });

        it('should return an error when database returns an error', () => {
          // Given
          const error = new Error('Unable to save assessment');
          assessmentWithScore.save.rejects(error);

          // When
          const promise = assessmentController.getNextChallenge({params: {id: 7531}}, replyStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledWith(badImplementationSpy, error);
            sinon.assert.calledWith(replyStub, Boom.badImplementation(error));
          });

        });

      });

    });

    describe('when the assessment is not over yet', () => {

      beforeEach(() => {
        assessmentService.getAssessmentNextChallengeId.resolves({});
      });

      it('should not evaluate assessment score', () => {
        // When
        const promise = assessmentController.getNextChallenge({params: {id: 7531}}, () => {
        });

        // Then
        return promise.then(() => {
          sinon.assert.notCalled(assessmentService.getScoredAssessment);
        });
      });

    });

  });

});

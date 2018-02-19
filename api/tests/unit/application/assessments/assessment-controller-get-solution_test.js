const { sinon } = require('../../../test-helper');

const Boom = require('boom');
const logger = require('../../../../lib/infrastructure/logger');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');

const solutionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/solution-serializer');

const Assessment = require('../../../../lib/domain/models/Assessment');
const Answer = require('../../../../lib/infrastructure/data/answer');
const Solution = require('../../../../lib/domain/models/referential/solution');

describe('Unit | Controller | assessment-controller', () => {

  describe('#getAssessmentSolution', () => {

    let sandbox;
    let replyStub;
    let codeStub;

    const boomResponseForConflict = { message: 'Boom Response for Conflict' };
    const boomResponseForNotFound = { message: 'Not found' };
    const boomResponseForbBadImplementation = { message: 'Bad Implementation' };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({
        code: codeStub
      });

      sandbox.stub(logger, 'error');
      sandbox.stub(Boom, 'notFound').returns(boomResponseForNotFound);
      sandbox.stub(Boom, 'conflict').returns(boomResponseForConflict);
      sandbox.stub(Boom, 'badImplementation').returns(boomResponseForbBadImplementation);
      sandbox.stub(assessmentRepository, 'get');
      sandbox.stub(answerRepository, 'get');
      sandbox.stub(solutionRepository, 'get');
      sandbox.stub(solutionSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return 404 when the assessment is not found', () => {
      // given
      assessmentRepository.get.resolves();

      // when
      const promise = assessmentController.getAssessmentSolution({ params: { id: 13465 } }, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(assessmentRepository.get, 13465);
        sinon.assert.calledOnce(Boom.notFound);
        sinon.assert.calledWith(replyStub, boomResponseForNotFound);
      });
    });

    it('should return 202 when the assessment is found but not completed yet', () => {
      // given
      assessmentRepository.get.resolves(new Assessment({ id: 13465, estimatedLevel: null, pixScore: null }));

      // when
      const promise = assessmentController.getAssessmentSolution({ params: { id: 13465 } }, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(assessmentRepository.get, 13465);
        sinon.assert.calledWith(Boom.conflict, 'Cette évaluation n\'est pas terminée.');
        sinon.assert.calledWith(replyStub, boomResponseForConflict);
      });
    });

    context('when a repository is on error', () => {
      it('should log the error for the assessmentRepository', () => {
        // given
        const error = new Error('Database locked');
        assessmentRepository.get.rejects(error);

        // when
        const promise = assessmentController.getAssessmentSolution({ params: { id: 13465 } }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(logger.error, error);
          sinon.assert.calledOnce(Boom.badImplementation);
          sinon.assert.calledWith(replyStub, boomResponseForbBadImplementation);
        });
      });

      it('should log the error for the answerRepository', () => {
        // given
        const error = new Error('Database locked');
        answerRepository.get.rejects(error);
        assessmentRepository.get.resolves(new Assessment({ id: 13465, estimatedLevel: 1, pixScore: 12 }));

        // when
        const promise = assessmentController.getAssessmentSolution({ params: { id: 13465 } }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(logger.error, error);
          sinon.assert.calledOnce(Boom.badImplementation);
          sinon.assert.calledWith(replyStub, boomResponseForbBadImplementation);
        });
      });
    });

    context('when the assessment exists and is completed', () => {
      beforeEach(() => {
        assessmentRepository.get.resolves(new Assessment({ id: 13465, estimatedLevel: 1, pixScore: 12 }));
      });

      context('when the answer is not found', () => {
        it('should return an 404 error', () => {
          // given
          answerRepository.get.resolves();

          // when
          const promise = assessmentController.getAssessmentSolution({ params: { id: 13465, answerId: 2467 } }, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(answerRepository.get, 2467);
            sinon.assert.calledOnce(Boom.notFound);
            sinon.assert.calledWith(replyStub, boomResponseForNotFound);
          });
        });
      });

      it('should reply the serialized solution', () => {
        // given
        const challengeId = '5738623';
        const solution = new Solution({});
        answerRepository.get.resolves(new Answer({ challengeId }));
        solutionRepository.get.resolves(solution);
        solutionSerializer.serialize.returns({ message: 'serialized solution' });

        // when
        const promise = assessmentController.getAssessmentSolution({ params: { id: 13465, answerId: 2467 } }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(solutionRepository.get, challengeId);
          sinon.assert.calledWith(solutionSerializer.serialize, solution);
          sinon.assert.calledWith(replyStub, { message: 'serialized solution' });
        });
      });

    });
  });

});

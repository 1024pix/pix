const { describe, it, beforeEach, afterEach, sinon, expect } = require('../../../test-helper');

const Boom = require('boom');

const assessmentRatingController = require('../../../../lib/application/assessment-ratings/assessment-rating-controller');
const assessmentRatingSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-rating-serializer');
const assessmentRatingService = require('../../../../lib/domain/services/assessment-rating-service');

const { AlreadyRatedAssessmentError, NotFoundError } = require('../../../../lib/domain/errors');

const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Controller | assessment-ratings', () => {

  describe('#evaluate', () => {

    let sandbox;
    let replyStub;

    const request = {
      payload: {
        data: {
          attributes: {
            'estimated-level': null,
            'pix-score': null
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: '22'
              }
            }
          },
          type: 'assessment-ratings'
        }
      }
    };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      replyStub = sinon.stub();
      sandbox.stub(assessmentRatingSerializer, 'serialize');
      sandbox.stub(assessmentRatingService, 'evaluateFromAssessmentId').resolves();
      sandbox.stub(Boom, 'notFound').returns({ message: 'NotFoundError' });
      sandbox.stub(Boom, 'badImplementation').returns({ message: 'badImplementation' });
      sandbox.stub(logger, 'error');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should evaluate the assessment', () => {
      // when
      assessmentRatingController.evaluate(request, replyStub);

      // then
      expect(assessmentRatingService.evaluateFromAssessmentId).to.have.been.calledWith('22');
    });

    it('should return 404 when the assessment is not found', () => {
      // given
      const notFoundAssessmentError = new NotFoundError();
      assessmentRatingService.evaluateFromAssessmentId.rejects(notFoundAssessmentError);

      // when
      const promise = assessmentRatingController.evaluate(request, replyStub);

      // then
      return promise.then(() => {
        expect(Boom.notFound).to.have.been.calledWith(notFoundAssessmentError);
        expect(replyStub).to.have.been.calledWith({ message: 'NotFoundError' });
      });
    });

    context('when the assessment is already evaluated', () => {
      it('should do nothing', () => {
        // given
        const alreadyRatedAssessmentError = new AlreadyRatedAssessmentError();
        assessmentRatingService.evaluateFromAssessmentId.rejects(alreadyRatedAssessmentError);

        // when
        const promise = assessmentRatingController.evaluate(request, replyStub);

        // then
        return promise.then(() => {
          expect(Boom.notFound).not.to.have.been.called;
          expect(replyStub).to.have.been.called;
        });
      });
    });

    context('when the database is fail', () => {
      it('should log the error', () => {
        // given
        const undefinedError = new Error();
        assessmentRatingService.evaluateFromAssessmentId.rejects(undefinedError);

        // when
        const promise = assessmentRatingController.evaluate(request, replyStub);

        // then
        return promise.then(() => {
          expect(logger.error).to.have.been.calledWith(undefinedError);
        });
      });

      it('should reply with an internal error', () => {
        // given
        const undefinedError = new Error();
        assessmentRatingService.evaluateFromAssessmentId.rejects(undefinedError);

        // when
        const promise = assessmentRatingController.evaluate(request, replyStub);

        // then
        return promise.then(() => {
          expect(Boom.badImplementation).to.have.been.calledWith(undefinedError);
          expect(replyStub).to.have.been.calledWith(Boom.badImplementation());
        });
      });
    });
  });
});

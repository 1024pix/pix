const { expect, sinon, factory } = require('../../../test-helper');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const skillReviewController = require('../../../../lib/application/skillReviews/skill-review-controller');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | skill-review-controller', () => {

  const replyStub = sinon.stub();
  const codeSpy = sinon.spy();

  beforeEach(() => {
    replyStub.returns({
      code: codeSpy
    });
  });

  afterEach(() => {
    replyStub.reset();
    codeSpy.resetHistory();
  });

  describe('#get', () => {
    const request = {
      params: {
        id: 'recSkillReviewId'
      }
    };

    beforeEach(() => {
      sinon.stub(usecases, 'getSkillReviewFromAssessmentId');
      sinon.stub(logger, 'error').returns();
    });

    afterEach(() => {
      usecases.getSkillReviewFromAssessmentId.restore();
      logger.error.restore();
    });

    context('on successful creation', () => {

      it('should return the serialized skillReview', () => {
        // given
        const assessmentId = request.params.id;
        const assessment = factory.buildAssessment({ id: assessmentId });
        const skillReview = factory.buildSkillReview({ assessment });
        const serializedSkillReview = {
          data: {
            id: 'recSkillReviewId',
            attributes: {
              'profile-mastery': 0,
            },
            type: 'skill-reviews',
            relationships: {
              assessment: {
                data: {
                  id: 'recSkillReviewId',
                  type: 'assessments',
                }
              }
            },
          }
        };

        usecases.getSkillReviewFromAssessmentId.resolves(skillReview);

        // when
        const promise = skillReviewController.get(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(usecases.getSkillReviewFromAssessmentId).to.have.been.calledWith({ assessmentId, assessmentRepository, answerRepository, challengeRepository });
            expect(replyStub).to.have.been.calledWith(serializedSkillReview);
            expect(codeSpy).to.have.been.calledWith(200);
          });
      });
    });

    context('if assessment does not exist', () => {

      it('should return a Not Found response', () => {
        // given
        const error = new NotFoundError();
        usecases.getSkillReviewFromAssessmentId.rejects(error);

        // when
        const promise = skillReviewController.get(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(logger.error).to.have.been.calledWith(error);
            expect(replyStub).to.have.been.calledWith();
            expect(codeSpy).to.have.been.calledWith(404);
          });
      });
    });

    context('if an internal error occurs', () => {

      it('should reply with a 500', () => {
        // given
        const error = new Error('Error');
        usecases.getSkillReviewFromAssessmentId.rejects(error);

        // when
        const promise = skillReviewController.get(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            const expectedJsonApiError = {
              errors: [{ code: '500', detail: 'Error', title: 'Internal Server Error' }]
            };
            expect(logger.error).to.have.been.calledWith(error);
            expect(replyStub).to.have.been.calledWith(expectedJsonApiError);
            expect(codeSpy).to.have.been.calledWith(500);
          });
      });
    });

  });

});

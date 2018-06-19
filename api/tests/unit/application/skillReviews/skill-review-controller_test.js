const { expect, sinon, factory, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const skillReviewController = require('../../../../lib/application/skillReviews/skill-review-controller');
const { NotFoundError, ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | Controller | skill-review-controller', () => {

  const userId = 60;

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
      },
      headers: {
        authorization: generateValidRequestAuhorizationHeader(userId)
      }
    };

    beforeEach(() => {
      sinon.stub(usecases, 'getSkillReview');
      sinon.stub(logger, 'error').returns();
    });

    afterEach(() => {
      usecases.getSkillReview.restore();
      logger.error.restore();
    });

    context('if assessment exists', () => {

      const skillReviewId = request.params.id;
      const assessmentId = skillReviewId;
      const assessment = factory.buildAssessment({ id: assessmentId, userId });
      const skillReview = factory.buildSkillReview({ assessment });

      context('that belongs to current user', () => {

        it('should return the serialized skillReview', () => {
          // given
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
          usecases.getSkillReview.resolves(skillReview);

          // when
          const promise = skillReviewController.get(request, replyStub);

          // Then
          return expect(promise).to.have.been.fulfilled
            .then(() => {
              expect(usecases.getSkillReview).to.have.been.calledWith({ skillReviewId, userId, assessmentRepository, answerRepository, challengeRepository });
              expect(replyStub).to.have.been.calledWith(serializedSkillReview);
              expect(codeSpy).to.have.been.calledWith(200);
            });
        });

        it('should reply with a 403', () => {
          // given
          const error = new ForbiddenAccess();
          usecases.getSkillReview.rejects(error);

          // when
          const promise = skillReviewController.get(request, replyStub);

          // Then
          return expect(promise).to.have.been.fulfilled
            .then(() => {
              expect(replyStub).to.have.been.calledWith();
              expect(codeSpy).to.have.been.calledWith(403);
            });
        });
      });

    });

    context('if assessment does not exist', () => {

      it('should reply with a 404', () => {
        // given
        const error = new NotFoundError();
        usecases.getSkillReview.rejects(error);

        // when
        const promise = skillReviewController.get(request, replyStub);

        // Then
        return expect(promise).to.have.been.fulfilled
          .then(() => {
            expect(replyStub).to.have.been.calledWith();
            expect(codeSpy).to.have.been.calledWith(404);
          });
      });
    });

    context('if an internal error occurs', () => {

      it('should reply with a 500', () => {
        // given
        const error = new Error('Error');
        usecases.getSkillReview.rejects(error);

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

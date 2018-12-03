const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const skillReviewController = require('../../../../lib/application/skillReviews/skill-review-controller');
const { UserNotAuthorizedToAccessEntity, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | skill-review-controller', () => {
  const userId = 60;

  describe('#get', () => {

    const skillReviewId = 'skill-review-1234';

    const request = {
      params: {
        id: skillReviewId,
      },
      auth: { credentials: { userId } },
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

      const skillReview = domainBuilder.buildSkillReview({ validatedSkills: [], failedSkills: [] });

      context('and belongs to current user', () => {

        it('should return the serialized skillReview', async () => {
          // given
          const serializedSkillReview = {
            data: {
              id: skillReviewId,
              attributes: {
                'profile-mastery-rate': 0,
                'profile-completion-rate': 0,
              },
              type: 'skill-reviews',
            },
          };
          usecases.getSkillReview.resolves(skillReview);

          // when
          const response = await skillReviewController.get(request, hFake);

          // Then
          expect(usecases.getSkillReview).to.have.been.calledWith({
            skillReviewId,
            userId,
          });

          expect(response.source).to.deep.equal(serializedSkillReview);
          expect(response.statusCode).to.equal(200);
        });
      });

      context('and does not belong to current user', () => {

        it('should reply with a 403', async () => {
          // given
          const expectedJsonAPIError = {
            errors: [{
              detail: 'Vous n’avez pas accès à ce profil d’avancement',
              code: '403',
              title: 'Unauthorized Access',
            }],
          };
          const error = new UserNotAuthorizedToAccessEntity();
          usecases.getSkillReview.rejects(error);

          // when
          const response = await skillReviewController.get(request, hFake);

          // Then
          expect(response.source).to.deep.equal(expectedJsonAPIError);
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('if assessment does not exist', () => {

      it('should reply with a 404', async () => {
        // given
        const expectedJsonAPIError = {
          errors: [{
            code: '404',
            detail: `Profil d’avancement introuvable pour l’id ${skillReviewId}`,
            title: 'Not Found',
          }],
        };
        const error = new NotFoundError(`Profil d'avancement introuvable pour l’id ${skillReviewId}`);
        usecases.getSkillReview.rejects(error);

        // when
        const response = await skillReviewController.get(request, hFake);

        // Then
        expect(response.source).to.deep.equal(expectedJsonAPIError);
        expect(response.statusCode).to.equal(404);
      });
    });

    context('if an internal error occurs', () => {

      it('should reply with a 500', async () => {
        // given
        const error = new Error('Error');
        usecases.getSkillReview.rejects(error);

        // when
        const response = await skillReviewController.get(request, hFake);

        // Then
        const expectedJsonApiError = {
          errors: [{
            code: '500',
            detail: 'Error',
            title: 'Internal Server Error',
          }],
        };
        expect(logger.error).to.have.been.calledWith(error);
        expect(response.source).to.deep.equal(expectedJsonApiError);
        expect(response.statusCode).to.equal(500);
      });
    });
  });
});

const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const smartPlacementProgressionController = require('../../../../lib/application/smartPlacementProgressions/smart-placement-progression-controller');
const { UserNotAuthorizedToAccessEntity, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | smart-placement-progression-controller', () => {
  const userId = 60;

  describe('#get', () => {

    const smartPlacementProgressionId = 'smart-placement-progression-1234';

    const request = {
      params: {
        id: smartPlacementProgressionId,
      },
      auth: { credentials: { userId } },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'getSmartPlacementProgression');
      sinon.stub(logger, 'error').returns();
    });

    context('if assessment exists', () => {

      let smartPlacementProgression;

      beforeEach(() => {
        smartPlacementProgression = domainBuilder.buildSmartPlacementProgression({ knowledgeElements: [], isProfileCompleted: true });
      });

      context('and belongs to current user', () => {

        it('should return the serialized smartPlacementProgression', async () => {
          // given
          const serializedSmartPlacementProgression = {
            data: {
              id: smartPlacementProgressionId,
              attributes: {
                'validation-rate': 0,
                'completion-rate': 1,
              },
              type: 'smart-placement-progressions',
            },
          };
          usecases.getSmartPlacementProgression.resolves(smartPlacementProgression);

          // when
          const response = await smartPlacementProgressionController.get(request, hFake);

          // Then
          expect(usecases.getSmartPlacementProgression).to.have.been.calledWith({
            smartPlacementProgressionId,
            userId,
          });

          expect(response).to.deep.equal(serializedSmartPlacementProgression);
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
          usecases.getSmartPlacementProgression.rejects(error);

          // when
          const response = await smartPlacementProgressionController.get(request, hFake);

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
            detail: `Profil d’avancement introuvable pour l’id ${smartPlacementProgressionId}`,
            title: 'Not Found',
          }],
        };
        const error = new NotFoundError(`Profil d'avancement introuvable pour l’id ${smartPlacementProgressionId}`);
        usecases.getSmartPlacementProgression.rejects(error);

        // when
        const response = await smartPlacementProgressionController.get(request, hFake);

        // Then
        expect(response.source).to.deep.equal(expectedJsonAPIError);
        expect(response.statusCode).to.equal(404);
      });
    });

    context('if an internal error occurs', () => {

      it('should reply with a 500', async () => {
        // given
        const error = new Error('Error');
        usecases.getSmartPlacementProgression.rejects(error);

        // when
        const response = await smartPlacementProgressionController.get(request, hFake);

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

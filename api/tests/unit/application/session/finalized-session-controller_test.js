const { expect, sinon, hFake } = require('../../../test-helper');
const finalizedSessionController = require('../../../../lib/application/sessions/finalized-session-controller');
const usecases = require('../../../../lib/domain/usecases');
const finalizedSessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/finalized-session-serializer');

describe('Unit | Controller | finalized-session', () => {
  let request;
  const userId = 274939274;

  describe('#findFinalizedSessionsToPublish', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'findFinalizedSessionsToPublish').resolves();
      sinon.stub(finalizedSessionSerializer, 'serialize');

      request = {
        payload: { },
        auth: {
          credentials: {
            userId,
          },
        },
      };
    });

    context('When there are finalized publishable sessions', () => {

      it('should find finalized publishable sessions', async () => {
        // given
        const foundFinalizedSessions = Symbol('foundSession');
        const serializedFinalizedSessions = Symbol('serializedSession');
        usecases.findFinalizedSessionsToPublish.resolves(foundFinalizedSessions);
        finalizedSessionSerializer.serialize.withArgs(foundFinalizedSessions).resolves(serializedFinalizedSessions);

        // when
        const response = await finalizedSessionController.findFinalizedSessionsToPublish(request, hFake);

        // then
        expect(response).to.deep.equal(serializedFinalizedSessions);
      });
    });

  });

  describe('#findFinalizedSessionsWithRequiredAction', () => {

    context('When there are finalized sessions with required action', () => {

      it('should find finalized sessions with required action', async () => {
        // given
        request = {
          payload: { },
          auth: {
            credentials: {
              userId,
            },
          },
        };

        const foundFinalizedSessions = Symbol('foundSession');
        sinon.stub(usecases, 'findFinalizedSessionsWithRequiredAction');
        usecases.findFinalizedSessionsWithRequiredAction.resolves(foundFinalizedSessions);

        sinon.stub(finalizedSessionSerializer, 'serialize');
        const serializedFinalizedSessions = Symbol('serializedSession');
        finalizedSessionSerializer.serialize.withArgs(foundFinalizedSessions).resolves(serializedFinalizedSessions);

        // when
        const response = await finalizedSessionController.findFinalizedSessionsWithRequiredAction(request, hFake);

        // then
        expect(response).to.deep.equal(serializedFinalizedSessions);
      });
    });

  });
});

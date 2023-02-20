import { expect, sinon, hFake } from '../../../test-helper';
import finalizedSessionController from '../../../../lib/application/sessions/finalized-session-controller';
import usecases from '../../../../lib/domain/usecases';
import toBePublishedSessionSerializer from '../../../../lib/infrastructure/serializers/jsonapi/to-be-published-session-serializer';
import withRequiredActionSessionSerializer from '../../../../lib/infrastructure/serializers/jsonapi/with-required-action-session-serializer';

describe('Unit | Controller | finalized-session', function () {
  let request;
  const userId = 274939274;

  describe('#findFinalizedSessionsToPublish', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'findFinalizedSessionsToPublish').resolves();
      sinon.stub(toBePublishedSessionSerializer, 'serialize');

      request = {
        payload: {},
        auth: {
          credentials: {
            userId,
          },
        },
      };
    });

    context('When there are finalized publishable sessions', function () {
      it('should find finalized publishable sessions', async function () {
        // given
        const foundFinalizedSessions = Symbol('foundSession');
        const serializedFinalizedSessions = Symbol('serializedSession');
        usecases.findFinalizedSessionsToPublish.resolves(foundFinalizedSessions);
        toBePublishedSessionSerializer.serialize.withArgs(foundFinalizedSessions).resolves(serializedFinalizedSessions);

        // when
        const response = await finalizedSessionController.findFinalizedSessionsToPublish(request, hFake);

        // then
        expect(response).to.deep.equal(serializedFinalizedSessions);
      });
    });
  });

  describe('#findFinalizedSessionsWithRequiredAction', function () {
    context('When there are finalized sessions with required action', function () {
      it('should find finalized sessions with required action', async function () {
        // given
        request = {
          payload: {},
          auth: {
            credentials: {
              userId,
            },
          },
        };

        const foundFinalizedSessions = Symbol('foundSession');
        sinon.stub(usecases, 'findFinalizedSessionsWithRequiredAction');
        usecases.findFinalizedSessionsWithRequiredAction.resolves(foundFinalizedSessions);

        sinon.stub(withRequiredActionSessionSerializer, 'serialize');
        const serializedFinalizedSessions = Symbol('serializedSession');
        withRequiredActionSessionSerializer.serialize
          .withArgs(foundFinalizedSessions)
          .resolves(serializedFinalizedSessions);

        // when
        const response = await finalizedSessionController.findFinalizedSessionsWithRequiredAction(request, hFake);

        // then
        expect(response).to.deep.equal(serializedFinalizedSessions);
      });
    });
  });
});

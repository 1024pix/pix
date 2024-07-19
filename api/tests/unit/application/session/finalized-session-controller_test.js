import { finalizedSessionController } from '../../../../lib/application/sessions/finalized-session-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | finalized-session', function () {
  let request;
  const userId = 274939274;

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
          query: { filter: {} },
        };

        const foundFinalizedSessions = Symbol('foundSession');
        sinon.stub(usecases, 'findFinalizedSessionsWithRequiredAction');
        usecases.findFinalizedSessionsWithRequiredAction.resolves(foundFinalizedSessions);

        const withRequiredActionSessionSerializer = {
          serialize: sinon.stub(),
        };
        const serializedFinalizedSessions = Symbol('serializedSession');
        withRequiredActionSessionSerializer.serialize
          .withArgs(foundFinalizedSessions)
          .resolves(serializedFinalizedSessions);

        // when
        const response = await finalizedSessionController.findFinalizedSessionsWithRequiredAction(request, hFake, {
          withRequiredActionSessionSerializer,
        });

        // then
        expect(response).to.deep.equal(serializedFinalizedSessions);
      });
      context('When filtering on version number', function () {
        it('should find finalized sessions with required action', async function () {
          // given
          const version = 3;
          request = {
            payload: {},
            query: {
              filter: { version },
            },
            auth: {
              credentials: {
                userId,
              },
            },
          };

          const foundFinalizedSessions = Symbol('foundSession');
          sinon.stub(usecases, 'findFinalizedSessionsWithRequiredAction');
          usecases.findFinalizedSessionsWithRequiredAction.withArgs({ version }).resolves(foundFinalizedSessions);

          const withRequiredActionSessionSerializer = {
            serialize: sinon.stub(),
          };
          const serializedFinalizedSessions = Symbol('serializedSession');
          withRequiredActionSessionSerializer.serialize
            .withArgs(foundFinalizedSessions)
            .resolves(serializedFinalizedSessions);

          // when
          const response = await finalizedSessionController.findFinalizedSessionsWithRequiredAction(request, hFake, {
            withRequiredActionSessionSerializer,
          });

          // then
          expect(response).to.deep.equal(serializedFinalizedSessions);
        });
      });
    });
  });
});

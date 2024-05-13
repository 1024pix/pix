import { sessionController } from '../../../../../src/certification/session-management/application/session-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | sessionController', function () {
  let request;
  const userId = 274939274;

  describe('#get', function () {
    const sessionId = 123;

    beforeEach(function () {
      sinon.stub(usecases, 'getSession');

      request = {
        auth: { credentials: { userId } },
        params: {
          id: sessionId,
        },
      };
    });

    context('when session exists', function () {
      it('should reply serialized session informations', async function () {
        // given
        const sessionSerializer = { serialize: sinon.stub() };
        const foundSession = Symbol('foundSession');
        const serializedSession = Symbol('serializedSession');
        usecases.getSession.withArgs({ sessionId }).resolves({ session: foundSession, hasSomeCleaAcquired: false });
        sessionSerializer.serialize
          .withArgs({ session: foundSession, hasSupervisorAccess: undefined, hasSomeCleaAcquired: false })
          .returns(serializedSession);

        // when
        const response = await sessionController.get(request, hFake, {
          sessionSerializer,
        });

        // then
        expect(response).to.deep.equal(serializedSession);
      });
    });
  });
});

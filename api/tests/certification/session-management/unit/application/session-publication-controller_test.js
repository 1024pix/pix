import { sessionPublicationController } from '../../../../../src/certification/session-management/application/session-publication-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

describe('Certification | Session-management | Unit | Application | Controller | Session Publication', function () {
  describe('#publish', function () {
    it('should return the serialized session', async function () {
      // given
      const sessionId = 123;
      const session = Symbol('session');
      const serializedSession = Symbol('serializedSession');
      const i18n = getI18n();
      const sessionManagementSerializer = { serialize: sinon.stub() };
      sinon
        .stub(usecases, 'publishSession')
        .withArgs({
          sessionId,
          i18n,
        })
        .resolves(session);
      sessionManagementSerializer.serialize.withArgs({ session }).resolves(serializedSession);

      // when
      const response = await sessionPublicationController.publish(
        {
          i18n,
          params: {
            id: sessionId,
          },
          payload: {
            data: { attributes: { toPublish: true } },
          },
        },
        hFake,
        { sessionManagementSerializer },
      );

      // then
      expect(response).to.equal(serializedSession);
    });
  });
});

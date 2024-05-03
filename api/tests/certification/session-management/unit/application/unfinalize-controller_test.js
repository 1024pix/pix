import { unfinalizeSession } from '../../../../../src/certification/session-management/application/unfinalize-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | unfinalize-controller', function () {
  describe('#unfinalizeSession', function () {
    it('should unfinalize the session', async function () {
      // given
      const request = {
        params: { id: 123 },
      };
      sinon.stub(usecases, 'unfinalizeSession');

      // when
      await unfinalizeSession(request, hFake);

      // then
      expect(usecases.unfinalizeSession).to.have.been.calledWithExactly({
        sessionId: 123,
      });
    });
  });
});

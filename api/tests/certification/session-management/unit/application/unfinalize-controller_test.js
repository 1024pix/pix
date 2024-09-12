import { unfinalizeSession } from '../../../../../src/certification/session-management/application/unfinalize-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Unfinalize', function () {
  describe('#unfinalizeSession', function () {
    it('should unfinalize the session', async function () {
      // given
      const request = {
        params: { sessionId: 123 },
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

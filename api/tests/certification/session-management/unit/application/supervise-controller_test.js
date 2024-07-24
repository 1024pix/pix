import { superviseController } from '../../../../../src/certification/session-management/application/supervise-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Supervise', function () {
  describe('#supervise', function () {
    it('should return a HTTP 204 No Content', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            userId: 274939274,
          },
        },
        params: { id: 123 },
        payload: {
          data: {
            attributes: {
              'session-id': '123',
              'supervisor-password': '567',
            },
            id: 123,
            type: 'supervisor-authentications',
          },
        },
      };

      sinon.stub(usecases, 'superviseSession');
      usecases.superviseSession.withArgs({ sessionId: '123', userId: 274939274, supervisorPassword: '567' }).resolves();

      // when
      const response = await superviseController.supervise(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});

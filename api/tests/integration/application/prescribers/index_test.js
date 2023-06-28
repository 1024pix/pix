import { expect, sinon, HttpTestServer } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/shared/application/security-pre-handlers.js';
import { prescriberController } from '../../../../lib/shared/application/prescribers/prescriber-controller.js';
import * as moduleUnderTest from '../../../../lib/shared/application/prescribers/index.js';

describe('Integration | Application | Prescribers | Routes', function () {
  let httpTestServer;
  const method = 'GET';

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');

    sinon.stub(prescriberController, 'get').returns('ok');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/prescription/prescribers/{id}', function () {
    const auth = { credentials: {}, strategy: {} };

    it('should exist', async function () {
      // given
      auth.credentials.userId = '1234';
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => h.response(true));
      const url = '/api/prescription/prescribers/123';

      // when
      const response = await httpTestServer.request(method, url, null, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 when id in param is not a number"', async function () {
      // given
      const url = '/api/prescription/prescribers/NOT_A_NUMBER';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});

import * as moduleUnderTest from '../../../../lib/application/prescribers/index.js';
import { prescriberController } from '../../../../lib/application/prescribers/prescriber-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | prescriber-router', function () {
  describe('GET /api/prescription/prescribers/{id}', function () {
    it('should exist', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      sinon.stub(prescriberController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/prescription/prescribers/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

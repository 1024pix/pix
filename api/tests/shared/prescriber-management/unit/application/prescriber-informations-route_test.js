import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { prescriberController } from '../../../../../src/shared/prescriber-management/application/prescriber-informations-controller.js';
import * as moduleUnderTest from '../../../../../src/shared/prescriber-management/application/prescriber-informations-route.js';

describe('Unit | Router | prescriber-informations-route', function () {
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

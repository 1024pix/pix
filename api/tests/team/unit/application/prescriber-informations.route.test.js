import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { prescriberInformationsController } from '../../../../src/team/application/prescriber-informations.controller.js';
import { teamRoutes } from '../../../../src/team/application/routes.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Team | Application | Route | prescriber-informations', function () {
  describe('GET /api/prescription/prescribers/{id}', function () {
    it('should exist', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      sinon.stub(prescriberInformationsController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      // when
      const response = await httpTestServer.request('GET', '/api/prescription/prescribers/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

import sinon from 'sinon';

import { anonymizeUserController } from '../../../../src/privacy/application/anonymize-user.controller.js';
import { privacyRoutes } from '../../../../src/privacy/application/routes.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Unit | Privacy | Application | Route | anonymize-user', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(privacyRoutes);
  });

  describe('POST /api/admin/users/{id}/anonymize', function () {
    it('returns 200 when user role is "SUPER_ADMIN"', async function () {
      // given
      sinon.stub(anonymizeUserController, 'anonymizeUserByAdmin').callsFake((request, h) => h.response({}).code(200));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      // when
      const { statusCode } = await httpTestServer.request('POST', '/api/admin/users/1/anonymize');

      // then
      expect(statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(anonymizeUserController.anonymizeUserByAdmin);
    });

    it('returns 200 when user role is "SUPPORT"', async function () {
      // given
      sinon.stub(anonymizeUserController, 'anonymizeUserByAdmin').callsFake((request, h) => h.response({}).code(200));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));

      // when
      const { statusCode } = await httpTestServer.request('POST', '/api/admin/users/1/anonymize');

      // then
      expect(statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(anonymizeUserController.anonymizeUserByAdmin);
    });

    it(`returns 403 when user don't have access (CERTIF | METIER)`, async function () {
      // given
      sinon.stub(anonymizeUserController, 'anonymizeUserByAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('POST', '/api/admin/users/1/anonymize', payload);

      // then
      expect(result.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.notCalled(anonymizeUserController.anonymizeUserByAdmin);
    });
  });
});

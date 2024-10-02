import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { userAdminController } from '../../../../../src/identity-access-management/application/user/user.admin.controller.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Unit | Identity Access Management | Application | Route | User', function () {
  describe('PATCH /api/admin/users/{id}', function () {
    it('verifies user identity and return success update when user role is "SUPER_ADMIN"', async function () {
      // given
      sinon.stub(userAdminController, 'updateUserDetailsByAdmin').returns('ok');
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(userAdminController.updateUserDetailsByAdmin);
    });

    it('verifies user identity and return success update when role is "SUPPORT"', async function () {
      // given
      sinon.stub(userAdminController, 'updateUserDetailsByAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(userAdminController.updateUserDetailsByAdmin);
    });

    it('returns bad request when param id is not numeric', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payload = { data: { attributes: { email: 'partial@update.net' } } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/not_number', payload);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('returns bad request when payload is not found', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/12344');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it(`returns 403 when user don't have access (CERTIF | METIER)`, async function () {
      // given
      sinon.stub(userAdminController, 'updateUserDetailsByAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

      // then
      expect(result.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.notCalled(userAdminController.updateUserDetailsByAdmin);
    });
  });
});

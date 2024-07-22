import { adminMemberController } from '../../../../lib/application/admin-members/admin-member-controller.js';
import * as adminMembersRouter from '../../../../lib/application/admin-members/index.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Router | admin-members-router', function () {
  describe('PUT /api/admin/admin-members/{id}/deactivate', function () {
    const method = 'PUT';
    const url = '/api/admin/admin-members/1/deactivate';

    describe('When user has role "SUPER_ADMIN"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(adminMemberController, 'deactivateAdminMember')
          .callsFake((request, h) => h.response('ok').code(204));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(adminMembersRouter);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.be.called;
        expect(adminMemberController.deactivateAdminMember).to.have.be.called;
        expect(statusCode).to.equal(204);
      });

      it('should return a 400 error when ID is invalid', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(adminMembersRouter);

        // when
        const { statusCode } = await httpTestServer.request(method, '/api/admin/admin-members/invalidID/deactivate');

        // then
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).not.to.have.be.called;
        expect(statusCode).to.equal(400);
      });
    });

    it('should return a response with an HTTP status code 403 if user does not have the rights', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.be.called;
      expect(statusCode).to.equal(403);
    });
  });
});

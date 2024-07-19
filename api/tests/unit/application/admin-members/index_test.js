import { adminMemberController } from '../../../../lib/application/admin-members/admin-member-controller.js';
import * as adminMembersRouter from '../../../../lib/application/admin-members/index.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { adminMemberController as srcAdminMemberController } from '../../../../src/team/application/admin-member/admin-member.controller.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Application | Router | admin-members-router', function () {
  describe('PATCH /api/admin/admin-members/{id}', function () {
    describe('when user has role "SUPER_ADMIN"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        const updatedAdminMember = domainBuilder.buildAdminMember();
        sinon.stub(srcAdminMemberController, 'updateAdminMember').returns(updatedAdminMember);
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(adminMembersRouter);

        // when
        const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/admin-members/1', {
          data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN } },
        });

        // then
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.be.called;
        expect(statusCode).to.equal(200);
      });

      it('should return 400 if the role value to update is invalid', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(adminMembersRouter);

        // when
        const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/admin-members/1', {
          data: { type: 'admin-members', attributes: { role: 'INVALID_ROLE' } },
        });

        // then
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).not.to.have.be.called;
        expect(statusCode).to.equal(400);
      });
    });

    it('should return a response with an HTTP status code 403 if user does not have the rights', async function () {
      // given
      sinon.stub(srcAdminMemberController, 'updateAdminMember').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/admin-members/1', {
        data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN } },
      });

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.be.called;
      expect(statusCode).to.equal(403);
    });
  });

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
      sinon.stub(srcAdminMemberController, 'updateAdminMember').returns('ok');
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

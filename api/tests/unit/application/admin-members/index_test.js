const { domainBuilder, expect, sinon, HttpTestServer } = require('../../../test-helper');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;
const adminMemberController = require('../../../../lib/application/admin-members/admin-member-controller');
const adminMembersRouter = require('../../../../lib/application/admin-members');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Unit | Application | Router | admin-members-router', function () {
  describe('GET /api/admin/admin-members', function () {
    it('should return a response with an HTTP status code 200 when user has role "SUPER_ADMIN"', async function () {
      // given
      const adminMembers = [domainBuilder.buildAdminMember()];
      sinon.stub(adminMemberController, 'findAll').returns(adminMembers);
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('GET', '/api/admin/admin-members');

      // then
      expect(statusCode).to.equal(200);
      sinon.assert.calledOnce(adminMemberController.findAll);
    });

    it('should return a response with an HTTP status code 403 if user does not have the rights', async function () {
      // given
      const adminMembers = [domainBuilder.buildAdminMember()];
      sinon.stub(adminMemberController, 'findAll').returns(adminMembers);
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('GET', '/api/admin/admin-members');

      // then
      expect(statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/admin/admin-members/{id}', function () {
    it('should return a response with an HTTP status code 200 when user has role "SUPER_ADMIN"', async function () {
      // given
      const updatedAdminMember = domainBuilder.buildAdminMember();
      sinon.stub(adminMemberController, 'updateAdminMember').returns(updatedAdminMember);
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/admin-members/1', {
        data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN } },
      });

      // then
      expect(statusCode).to.equal(200);
      sinon.assert.calledOnce(adminMemberController.updateAdminMember);
    });

    it('should return a response with an HTTP status code 403 if user does not have the rights', async function () {
      // given
      sinon.stub(adminMemberController, 'updateAdminMember').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/admin-members/1', {
        data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN } },
      });

      // then
      expect(statusCode).to.equal(403);
      sinon.assert.notCalled(adminMemberController.updateAdminMember);
    });
  });
});

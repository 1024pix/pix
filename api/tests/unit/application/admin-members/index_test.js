import { domainBuilder, expect, sinon, HttpTestServer } from '../../../test-helper.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

import { adminMemberController } from '../../../../lib/application/admin-members/admin-member-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import * as adminMembersRouter from '../../../../lib/application/admin-members/index.js';

describe('Unit | Application | Router | admin-members-router', function () {
  describe('GET /api/admin/admin-members/me', function () {
    it('should return a response with an HTTP status code 200', async function () {
      // given
      const adminMember = domainBuilder.buildAdminMember();
      sinon.stub(adminMemberController, 'getCurrentAdminMember').returns(adminMember);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('GET', '/api/admin/admin-members/me');

      // then
      expect(adminMemberController.getCurrentAdminMember).to.have.be.called;
      expect(statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/admin-members', function () {
    it('should return a response with an HTTP status code 200 when user has role "SUPER_ADMIN"', async function () {
      // given
      const adminMembers = [domainBuilder.buildAdminMember()];
      sinon.stub(adminMemberController, 'findAll').returns(adminMembers);
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('GET', '/api/admin/admin-members');

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.be.called;
      expect(adminMemberController.findAll).to.have.be.called;
      expect(statusCode).to.equal(200);
    });

    it('should return a response with an HTTP status code 403 if user does not have the rights', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminMembersRouter);

      // when
      const { statusCode } = await httpTestServer.request('GET', '/api/admin/admin-members');

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.be.called;
      expect(statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/admin-members', function () {
    context('when user has role "SUPER_ADMIN"', function () {
      it('should return a response with an HTTP status code 201', async function () {
        // given
        const adminMember = domainBuilder.buildAdminMember();
        sinon
          .stub(adminMemberController, 'saveAdminMember')
          .callsFake((request, h) => h.response(adminMember).created());
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(adminMembersRouter);

        // when
        const { statusCode } = await httpTestServer.request('POST', '/api/admin/admin-members', {
          data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN, email: 'fire.bot@example.net' } },
        });

        // then
        expect(statusCode).to.equal(201);
      });

      context('when role attribute is missing', function () {
        it('should return a response with an HTTP status code 400', async function () {
          // given
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(adminMembersRouter);

          // when
          const { statusCode } = await httpTestServer.request('POST', '/api/admin/admin-members', {
            data: { type: 'admin-members', attributes: { email: 'fire.bot@example.net' } },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when role attribute is not valid', function () {
        it('should return a response with an HTTP status code 400', async function () {
          // given
          const adminMember = domainBuilder.buildAdminMember();
          sinon.stub(adminMemberController, 'saveAdminMember').returns(adminMember);
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(adminMembersRouter);

          // when
          const { statusCode } = await httpTestServer.request('POST', '/api/admin/admin-members', {
            data: { type: 'admin-members', attributes: { role: 'My-Role', email: 'fire.bot@example.net' } },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when email attribute is missing', function () {
        it('should return a response with an HTTP status code 400', async function () {
          // given
          const adminMember = domainBuilder.buildAdminMember();
          sinon.stub(adminMemberController, 'saveAdminMember').returns(adminMember);
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(adminMembersRouter);

          // when
          const { statusCode } = await httpTestServer.request('POST', '/api/admin/admin-members', {
            data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN } },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when email attribute is not valid', function () {
        it('should return a response with an HTTP status code 400', async function () {
          // given
          const adminMember = domainBuilder.buildAdminMember();
          sinon.stub(adminMemberController, 'saveAdminMember').returns(adminMember);
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(adminMembersRouter);

          // when
          const { statusCode } = await httpTestServer.request('POST', '/api/admin/admin-members', {
            data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN, email: 'my-invalid-email' } },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when all attributes are missing', function () {
        it('should return a response with an HTTP status code 400', async function () {
          // given
          const adminMember = domainBuilder.buildAdminMember();
          sinon.stub(adminMemberController, 'saveAdminMember').returns(adminMember);
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(adminMembersRouter);

          // when
          const { statusCode } = await httpTestServer.request('POST', '/api/admin/admin-members', {
            data: { type: 'admin-members', attributes: {} },
          });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user does not have role "SUPER_ADMIN"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(adminMembersRouter);

        // when
        const { statusCode } = await httpTestServer.request('POST', '/api/admin/admin-members', {
          data: { type: 'admin-members', attributes: { role: ROLES.SUPER_ADMIN, email: 'aqua.bot@example.net' } },
        });

        // then
        expect(statusCode).to.equal(403);
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.be.called;
      });
    });
  });

  describe('PATCH /api/admin/admin-members/{id}', function () {
    describe('when user has role "SUPER_ADMIN"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        const updatedAdminMember = domainBuilder.buildAdminMember();
        sinon.stub(adminMemberController, 'updateAdminMember').returns(updatedAdminMember);
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
      sinon.stub(adminMemberController, 'updateAdminMember').returns('ok');
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
      sinon.stub(adminMemberController, 'updateAdminMember').returns('ok');
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

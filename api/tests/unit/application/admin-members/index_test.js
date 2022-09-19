const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const cloneDeep = require('lodash/cloneDeep');
const adminMemberController = require('../../../../lib/application/admin-members/admin-member-controller');
const adminMembersRouter = require('../../../../lib/application/admin-members');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Unit | Application | Router | admin-members', function () {
  let httpTestServer, method, url;
  beforeEach(function () {
    httpTestServer = new HttpTestServer();
  });

  describe('GET /api/admin/admin-members/me', function () {
    beforeEach(function () {
      method = 'GET';
      url = '/api/admin/admin-members/me';
    });

    it('should access controller handler', async function () {
      // given
      sinon.stub(adminMemberController, 'getCurrentAdminMember').returns('ok');
      await httpTestServer.register(adminMembersRouter);

      // when
      await httpTestServer.request(method, url);

      // then
      expect(adminMemberController.getCurrentAdminMember).to.have.be.calledOnce;
    });
  });

  describe('GET /api/admin/admin-members', function () {
    beforeEach(function () {
      method = 'GET';
      url = '/api/admin/admin-members';
    });
    context('Authorization check', function () {
      it('should access controller\'s handler when user has role "SUPER_ADMIN"', async function () {
        // given
        sinon.stub(adminMemberController, 'findAll').returns('ok');
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        await httpTestServer.register(adminMembersRouter);

        // when
        await httpTestServer.request(method, url);

        // then
        expect(adminMemberController.findAll).to.have.be.calledOnce;
      });

      it('should not access controller\'s handler and return error code 403 when user has not role "SUPER_ADMIN"', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        sinon.stub(adminMemberController, 'findAll').throws('I should not be called');
        await httpTestServer.register(adminMembersRouter);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
        expect(adminMemberController.findAll).to.not.have.been.called;
      });
    });
  });

  describe('POST /api/admin/admin-members', function () {
    const validPayload = {
      data: {
        attributes: {
          email: 'the-slayer@sunnydale.com',
          role: 'SUPER_ADMIN',
        },
      },
    };
    beforeEach(function () {
      method = 'POST';
      url = '/api/admin/admin-members';
    });

    context('Success cases', function () {
      beforeEach(function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(adminMemberController, 'saveAdminMember').returns('ok');
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and payload is valid with role SUPER_ADMIN', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadSuperAdminRole = cloneDeep(validPayload);
        validPayloadSuperAdminRole.data.attributes['role'] = 'SUPER_ADMIN';

        // when
        await httpTestServer.request(method, url, validPayloadSuperAdminRole);

        // then
        expect(adminMemberController.saveAdminMember).to.have.been.calledOnce;
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and payload is valid with role SUPPORT', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadSupportRole = cloneDeep(validPayload);
        validPayloadSupportRole.data.attributes['role'] = 'SUPPORT';

        // when
        await httpTestServer.request(method, url, validPayloadSupportRole);

        // then
        expect(adminMemberController.saveAdminMember).to.have.been.calledOnce;
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and payload is valid with role METIER', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadMetierRole = cloneDeep(validPayload);
        validPayloadMetierRole.data.attributes['role'] = 'METIER';

        // when
        await httpTestServer.request(method, url, validPayloadMetierRole);

        // then
        expect(adminMemberController.saveAdminMember).to.have.been.calledOnce;
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and payload is valid with role CERTIF', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadCertifRole = cloneDeep(validPayload);
        validPayloadCertifRole.data.attributes['role'] = 'CERTIF';

        // when
        await httpTestServer.request(method, url, validPayloadCertifRole);

        // then
        expect(adminMemberController.saveAdminMember).to.have.been.calledOnce;
      });
    });

    context('Error cases', function () {
      beforeEach(function () {
        sinon.stub(adminMemberController, 'saveAdminMember').throws('I should not be called');
      });

      it('should not access controller\'s handler and return error code 403 when user has not role "SUPER_ADMIN"', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        await httpTestServer.register(adminMembersRouter);

        // when
        const response = await httpTestServer.request(method, url, validPayload);

        // then
        expect(response.statusCode).to.equal(403);
        expect(adminMemberController.saveAdminMember).to.not.have.been.called;
      });

      context('Payload validation', function () {
        beforeEach(function () {
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        });

        it("should not call controller's handler and return error code 400 when email is not provided", async function () {
          // given
          await httpTestServer.register(adminMembersRouter);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['email'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.email" must be a string',
          });
          expect(adminMemberController.saveAdminMember).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when email is not valid", async function () {
          // given
          await httpTestServer.register(adminMembersRouter);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['email'] = 'not_an_email';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.email" must be a valid email',
          });
          expect(adminMemberController.saveAdminMember).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when role is not provided", async function () {
          // given
          await httpTestServer.register(adminMembersRouter);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['role'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.role" must be one of [SUPER_ADMIN, SUPPORT, METIER, CERTIF]',
          });
          expect(adminMemberController.saveAdminMember).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when role is not one of allowed values", async function () {
          // given
          await httpTestServer.register(adminMembersRouter);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['role'] = 'MADE_UP_ROLE';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.role" must be one of [SUPER_ADMIN, SUPPORT, METIER, CERTIF]',
          });
          expect(adminMemberController.saveAdminMember).to.not.have.been.called;
        });
      });
    });
  });

  describe('PATCH /api/admin/admin-members/{id}', function () {
    const validIdParam = 123;
    const validPayload = {
      data: {
        attributes: {
          role: 'SUPER_ADMIN',
        },
      },
    };
    beforeEach(function () {
      method = 'PATCH';
      url = '/api/admin/admin-members/';
    });

    context('Success cases', function () {
      beforeEach(function () {
        url = `${url}${validIdParam}`;
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(adminMemberController, 'updateAdminMember').returns('ok');
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and params are valid and payload is valid with role SUPER_ADMIN', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadSuperAdminRole = cloneDeep(validPayload);
        validPayloadSuperAdminRole.data.attributes['role'] = 'SUPER_ADMIN';

        // when
        await httpTestServer.request(method, url, validPayloadSuperAdminRole);

        // then
        expect(adminMemberController.updateAdminMember).to.have.been.calledOnce;
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and params are valid and payload is valid with role SUPPORT', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadSupportRole = cloneDeep(validPayload);
        validPayloadSupportRole.data.attributes['role'] = 'SUPPORT';

        // when
        await httpTestServer.request(method, url, validPayloadSupportRole);

        // then
        expect(adminMemberController.updateAdminMember).to.have.been.calledOnce;
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and params are valid and payload is valid with role METIER', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadMetierRole = cloneDeep(validPayload);
        validPayloadMetierRole.data.attributes['role'] = 'METIER';

        // when
        await httpTestServer.request(method, url, validPayloadMetierRole);

        // then
        expect(adminMemberController.updateAdminMember).to.have.been.calledOnce;
      });

      it('should call controller\'s handler when user has role "SUPER_ADMIN" and params are valid and payload is valid with role CERTIF', async function () {
        // given
        await httpTestServer.register(adminMembersRouter);
        const validPayloadCertifRole = cloneDeep(validPayload);
        validPayloadCertifRole.data.attributes['role'] = 'CERTIF';

        // when
        await httpTestServer.request(method, url, validPayloadCertifRole);

        // then
        expect(adminMemberController.updateAdminMember).to.have.been.calledOnce;
      });
    });

    context('Error cases', function () {
      beforeEach(function () {
        sinon.stub(adminMemberController, 'updateAdminMember').throws('I should not be called');
      });

      it('should not access controller\'s handler and return error code 403 when user has not role "SUPER_ADMIN"', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        await httpTestServer.register(adminMembersRouter);
        url = `${url}${validIdParam}`;

        // when
        const response = await httpTestServer.request(method, url, validPayload);

        // then
        expect(response.statusCode).to.equal(403);
        expect(adminMemberController.updateAdminMember).to.not.have.been.called;
      });

      it("should not access controller's handler and return error code 400 when ID param is not valid", async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        await httpTestServer.register(adminMembersRouter);
        url = `${url}coucou`;

        // when
        const response = await httpTestServer.request(method, url, validPayload);

        // then
        const error = response?.result?.errors?.[0];
        expect(response.statusCode).to.equal(400);
        expect(error).to.deep.equal({
          status: '400',
          title: 'Bad Request',
          detail: '"id" must be a number',
        });
        expect(adminMemberController.updateAdminMember).to.not.have.been.called;
      });

      context('Payload validation', function () {
        beforeEach(function () {
          url = `${url}${validIdParam}`;
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        });

        it("should not call controller's handler and return error code 400 when role is not provided", async function () {
          // given
          await httpTestServer.register(adminMembersRouter);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['role'] = null;

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.role" must be one of [SUPER_ADMIN, SUPPORT, METIER, CERTIF]',
          });
          expect(adminMemberController.updateAdminMember).to.not.have.been.called;
        });

        it("should not call controller's handler and return error code 400 when role is not one of allowed values", async function () {
          // given
          await httpTestServer.register(adminMembersRouter);
          const invalidPayload = cloneDeep(validPayload);
          invalidPayload.data.attributes['role'] = 'MADE_UP_ROLE';

          // when
          const response = await httpTestServer.request(method, url, invalidPayload);

          // then
          const error = response?.result?.errors?.[0];
          expect(response.statusCode).to.equal(400);
          expect(error).to.deep.equal({
            status: '400',
            title: 'Bad Request',
            detail: '"data.attributes.role" must be one of [SUPER_ADMIN, SUPPORT, METIER, CERTIF]',
          });
          expect(adminMemberController.updateAdminMember).to.not.have.been.called;
        });
      });
    });
  });

  describe('PUT /api/admin/admin-members/{id}/deactivate', function () {
    const validIdParam = 123;
    beforeEach(function () {
      method = 'PUT';
      url = '/api/admin/admin-members/';
    });

    it('should call controller\'s handler when user has role "SUPER_ADMIN" and params are valid', async function () {
      // given
      url = `${url}${validIdParam}/deactivate`;
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
      sinon.stub(adminMemberController, 'deactivateAdminMember').returns('ok');
      await httpTestServer.register(adminMembersRouter);

      // when
      await httpTestServer.request(method, url);

      // then
      expect(adminMemberController.deactivateAdminMember).to.have.been.calledOnce;
    });

    context('Error cases', function () {
      beforeEach(function () {
        sinon.stub(adminMemberController, 'deactivateAdminMember').throws('I should not be called');
      });

      it('should not access controller\'s handler and return error code 403 when user has not role "SUPER_ADMIN"', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        await httpTestServer.register(adminMembersRouter);
        url = `${url}${validIdParam}/deactivate`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
        expect(adminMemberController.deactivateAdminMember).to.not.have.been.called;
      });

      it("should not access controller's handler and return error code 400 when ID param is not valid", async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        await httpTestServer.register(adminMembersRouter);
        url = `${url}coucou/deactivate`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        const error = response?.result?.errors?.[0];
        expect(response.statusCode).to.equal(400);
        expect(error).to.deep.equal({
          status: '400',
          title: 'Bad Request',
          detail: '"id" must be a number',
        });
        expect(adminMemberController.deactivateAdminMember).to.not.have.been.called;
      });
    });
  });
});

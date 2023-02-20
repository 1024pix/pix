import { expect, HttpTestServer, sinon, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import frameworksController from '../../../../lib/application/frameworks/frameworks-controller';
import moduleUnderTest from '../../../../lib/application/frameworks';

describe('Unit | Application | Frameworks | Routes', function () {
  describe('GET /api/admin/frameworks', function () {
    const method = 'GET';
    const url = '/api/admin/frameworks';

    it('should return a response with an HTTP status code 200 when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(() => (request, h) => h.response(true));
      sinon.stub(frameworksController, 'getFrameworks').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(200);
    });

    it('should return a response with an HTTP status code 403 when user has role "CERTIF"', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover()
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/frameworks/{id}/areas', function () {
    const method = 'GET';
    const url = '/api/admin/frameworks/1/areas';

    it('should return a response with an HTTP status code 200 when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(() => (request, h) => h.response(true));
      sinon.stub(frameworksController, 'getFrameworkAreas').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(200);
    });

    it('should return a response with an HTTP status code 403 when user has role "CERTIF"', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover()
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(403);
    });
  });

  describe('GET /api/frameworks/pix/areas-for-user', function () {
    const method = 'GET';
    const url = '/api/frameworks/pix/areas-for-user';

    it('should return a response with an HTTP status code 200 when user is logged in', async function () {
      // given
      sinon
        .stub(frameworksController, 'getPixFrameworkAreasWithoutThematics')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(moduleUnderTest);
      const headers = {
        authorization: generateValidRequestAuthorizationHeader(),
      };

      // when
      const { statusCode } = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(statusCode).to.equal(200);
    });

    it('should return a response with an HTTP status code 401 when user is not logged', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(401);
    });
  });
});

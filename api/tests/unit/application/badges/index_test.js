const { domainBuilder, expect, sinon, HttpTestServer } = require('../../../test-helper');
const badgesController = require('../../../../lib/application/badges/badges-controller');
const badgesRouter = require('../../../../lib/application/badges');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Unit | Application | Badges | Routes', function () {
  describe('GET /api/admin/badges/{id}', function () {
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        const badge = domainBuilder.buildBadge();
        sinon.stub(badgesController, 'getBadge').returns(badge);
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('GET', '/api/admin/badges/1');

        // then
        expect(statusCode).to.equal(200);
      });

      context('when badge id is invalid', function () {
        it('should return a response with an HTTP status code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(badgesRouter);

          // when
          const { statusCode } = await httpTestServer.request('GET', '/api/admin/badges/invalid-id');

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
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
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('GET', '/api/admin/badges/1');

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('DELETE /api/admin/badges/{id}', function () {
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return an HTTP status code 204', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(badgesController, 'deleteUnassociatedBadge').returns(null);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('DELETE', '/api/admin/badges/1');

        // then
        expect(statusCode).to.equal(204);
      });

      context('when badge id is invalid', function () {
        it('should return an HTTP status code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(badgesRouter);

          // when
          const { statusCode } = await httpTestServer.request('DELETE', '/api/admin/badges/invalid-id');

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
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
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('DELETE', '/api/admin/badges/1');

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});

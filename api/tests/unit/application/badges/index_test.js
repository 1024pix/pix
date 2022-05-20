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
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkUserHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkUserHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('GET', '/api/admin/badges/1');

        // then
        expect(statusCode).to.equal(200);
      });

      it('should return a response with an HTTP status code 400 when badge id is invalid', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('GET', '/api/admin/badges/invalid-id');

        // then
        expect(statusCode).to.equal(400);
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkUserHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkUserHasRoleMetier,
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
});

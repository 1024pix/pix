const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const tubeController = require('../../../../lib/application/tubes/tube-controller');
const moduleUnderTest = require('../../../../lib/application/tubes');

describe('Unit | Application | Tubes | Routes', function () {
  describe('GET /api/admin/tubes/{id}/skills', function () {
    const method = 'GET';
    const url = '/api/admin/tubes/recs1vdbHxX8X55G9/skills';

    it('should return a response with an HTTP status code 200 when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkUserHasRoleSupport,
          securityPreHandlers.checkUserHasRoleMetier,
        ])
        .callsFake(() => (request, h) => h.response(true));
      sinon.stub(tubeController, 'listSkills').callsFake((request, h) => h.response('ok').code(200));
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
        .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
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
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(403);
    });
  });
});

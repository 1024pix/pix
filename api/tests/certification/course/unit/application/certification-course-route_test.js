import { expect, sinon, HttpTestServer } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../../src/certification/course/application/certification-course-route.js';
describe('Unit | Route | certification-course-route', function () {
  describe('POST /api/admin/certification-courses/{id}/reject', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification-courses/1/reject');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/certification-courses/{id}/unreject', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/certification-courses/1/unreject');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/certification-courses-v3/{id}/details', function () {
    it('returns a 200', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(() => (request, h) => h.response().code(200).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/certification-courses-v3/1/details');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

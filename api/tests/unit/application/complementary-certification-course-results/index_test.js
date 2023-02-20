import { expect, HttpTestServer, sinon } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import moduleUnderTest from '../../../../lib/application/complementary-certification-course-results';

describe('Unit | Application | Complementary Certification Course Results | Route', function () {
  describe('POST /api/admin/complementary-certification-course-results', function () {
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
              .takeover()
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/complementary-certification-course-results', {
        data: {
          attributes: {
            juryLevel: 'JURY_LEVEL_KEY',
            complementaryCertificationCourseId: 1234,
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});

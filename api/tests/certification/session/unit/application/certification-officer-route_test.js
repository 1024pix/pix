import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { certificationOfficerController } from '../../../../../src/certification/session/application/certification-officer-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session/application/certification-officer-route.js';

describe('Unit | Router | certification-officer-route', function () {
  describe('PATCH /api/admin/sessions/{id}/certification-officer-assignment', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationOfficerController, 'assignCertificationOfficer').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/certification-officer-assignment');

      // then
      expect(response.statusCode).to.equal(200);
    });

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
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/certification-officer-assignment');

      // then
      expect(response.statusCode).to.equal(403);
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        condition: 'session ID params is not a number',
        request: { method: 'PATCH', url: '/api/admin/sessions/salut/certification-officer-assignment' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/certification-officer-assignment' },
      },
    ].forEach(({ condition, request }) => {
      it(`should return 400 when ${condition}`, async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(request.method, request.url, request.payload || null);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});

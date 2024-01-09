import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import * as moduleUnderTest from '../../../../../src/certification/session/application/session-unfinalize-route.js';
import { expect, sinon } from '../../../../test-helper.js';
import { unfinalizeController } from '../../../../../src/certification/session/application/unfinalize-controller.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';

describe('Unit | Router | session-unfinalize', function () {
  describe('PATCH /api/admin/sessions/{id}/unfinalize', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        condition: 'session ID params is not a number',
        request: { method: 'PATCH', url: '/api/admin/sessions/wrong/unfinalize' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/unfinalize' },
      },
    ].forEach(({ condition, request }) => {
      describe(`when ${condition}`, function () {
        it(`should return 400`, async function () {
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

    describe(`when user has no role`, function () {
      it(`should return 403`, async function () {
        // given
        sinon.stub(unfinalizeController, 'unfinalizeSession').callsFake((_, h) => h.response().code(204));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((_, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif')
          .callsFake((_, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((_, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/sessions/123/unfinalize');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    it('should exist', async function () {
      // given
      sinon.stub(unfinalizeController, 'unfinalizeSession').callsFake((_, h) => h.response().code(204));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((_, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((_, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((_, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/123/unfinalize');

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});

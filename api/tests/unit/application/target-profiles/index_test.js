import * as moduleUnderTest from '../../../../lib/application/target-profiles/index.js';
import { targetProfileController } from '../../../../lib/application/target-profiles/target-profile-controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Target Profiles | Routes', function () {
  describe('GET /api/admin/target-profiles/{id}/training-summaries', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1/training-summaries';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findPaginatedTrainings')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when id is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/training-summaries',
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
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
                .takeover(),
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
});

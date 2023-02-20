import { expect, sinon, HttpTestServer } from '../../../test-helper';
import badgesController from '../../../../lib/application/badges/badges-controller';
import badgesRouter from '../../../../lib/application/badges';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';

describe('Unit | Application | Badges | Routes', function () {
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

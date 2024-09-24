import { sessionPublicationController } from '../../../../../src/certification/session-management/application/session-publication-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/session-publication-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Sessions | Routes', function () {
  describe('For admin', function () {
    describe('PATCH /api/admin/sessions/{id}/publish', function () {
      it('should exist', async function () {
        // given
        sinon.stub(sessionPublicationController, 'publish').returns('ok');
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').resolves(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/publish', {
          data: {
            attributes: {
              toPublish: true,
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('return forbidden access if user has METIER role', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
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
        const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/publish', {
          data: {
            attributes: {
              toPublish: true,
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});

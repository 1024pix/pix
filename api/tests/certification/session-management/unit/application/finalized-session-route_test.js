import { finalizedSessionController } from '../../../../../src/certification/session-management/application/finalized-session-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/finalized-session-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session-management | Unit | Application | finalized-session-route', function () {
  describe('For admin', function () {
    describe('GET /api/admin/sessions/to-publish', function () {
      it('exists', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(finalizedSessionController, 'findFinalizedSessionsToPublish').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions/to-publish');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('is protected by a prehandler checking the SUPER_ADMIN role', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions/to-publish');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('GET /api/admin/sessions/with-required-action', function () {
      it('exists', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(finalizedSessionController, 'findFinalizedSessionsWithRequiredAction').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions/with-required-action');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('is protected by a prehandler checking the SUPER_ADMIN role', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions/with-required-action');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});

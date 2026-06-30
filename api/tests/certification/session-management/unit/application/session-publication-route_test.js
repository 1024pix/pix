import sinon from 'sinon';

import { sessionPublicationController } from '../../../../../src/certification/session-management/application/session-publication-controller.js';
import { sessionPublicationRoute as moduleUnderTest } from '../../../../../src/certification/session-management/application/session-publication-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

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

    describe('PATCH /api/admin/sessions/{sessionId}/unpublish', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionPublicationController, 'unpublish').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/unpublish');

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
        const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/unpublish');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('POST /api/admin/sessions/publish-in-batch', function () {
      it('is protected by a pre-handler checking authorization to access Pix Admin', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              ids: [1, 2, 3],
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/sessions/publish-in-batch', payload);

        // then
        expect(response.statusCode).to.equal(403);
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
        const response = await httpTestServer.request('POST', '/api/admin/sessions/publish-in-batch', {
          data: {
            attributes: {
              ids: [1, 2, 3],
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should succeed with valid session ids', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionPublicationController, 'publishInBatch').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              ids: [1, 2, 3],
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/sessions/publish-in-batch', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should validate the session ids in payload', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              ids: ['an invalid session id'],
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/sessions/publish-in-batch', payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});

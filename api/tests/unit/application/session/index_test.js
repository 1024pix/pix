import { NotFoundError } from '../../../../lib/application/http-errors.js';
import * as moduleUnderTest from '../../../../lib/application/sessions/index.js';
import { sessionController } from '../../../../lib/application/sessions/session-controller.js';
import { sessionWithCleaCertifiedCandidateController } from '../../../../lib/application/sessions/session-with-clea-certified-candidate-controller.js';
import { authorization } from '../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Sessions | Routes', function () {
  describe('POST /api/sessions/{id}/candidate-participation', function () {
    it('should exist', async function () {
      // given
      sinon.stub(sessionController, 'createCandidateParticipation').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/sessions/3/candidate-participation');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('For admin', function () {
    describe('GET /api/admin/sessions/{id}/jury-certification-summaries', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'getJuryCertificationSummaries').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions/1/jury-certification-summaries');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('PATCH /api/admin/sessions/{id}/publish', function () {
      it('should exist', async function () {
        // given
        sinon.stub(sessionController, 'publish').returns('ok');
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

    describe('PATCH /api/admin/sessions/{id}/unpublish', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'unpublish').returns('ok');
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
        sinon.stub(sessionController, 'publishInBatch').returns('ok');
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

    describe('PUT /api/admin/sessions/{id}/results-sent-to-prescriber', function () {
      it('should exist', async function () {
        // when
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'flagResultsAsSentToPrescriber').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('PUT', '/api/admin/sessions/3/results-sent-to-prescriber');

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
        const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/results-sent-to-prescriber');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('GET /api/admin/sessions/{id}/generate-results-download-link', function () {
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
        const response = await httpTestServer.request('GET', '/api/admin/sessions/1/generate-results-download-link');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('DELETE /api/sessions/{id}', function () {
    it('returns a 404 NOT_FOUND error if verifySessionAuthorization fails', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/sessions/3');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/sessions/{id}/certified-clea-candidate-data', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionWithCleaCertifiedCandidateController, 'getCleaCertifiedCandidateDataCsv').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/certified-clea-candidate-data');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

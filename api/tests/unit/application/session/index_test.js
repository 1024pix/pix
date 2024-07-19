import fs from 'node:fs';
import { stat, unlink, writeFile } from 'node:fs/promises';
import * as url from 'node:url';

import FormData from 'form-data';
import streamToPromise from 'stream-to-promise';

import { NotFoundError } from '../../../../lib/application/http-errors.js';
import { finalizedSessionController } from '../../../../lib/application/sessions/finalized-session-controller.js';
import * as moduleUnderTest from '../../../../lib/application/sessions/index.js';
import { sessionController } from '../../../../lib/application/sessions/session-controller.js';
import { sessionWithCleaCertifiedCandidateController } from '../../../../lib/application/sessions/session-with-clea-certified-candidate-controller.js';
import { authorization } from '../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Unit | Application | Sessions | Routes', function () {
  describe('POST /api/sessions/{id}/certification-candidates/import', function () {
    const testFilePath = `${__dirname}/testFile_temp.ods`;
    const method = 'POST';

    let headers;
    let payload;

    beforeEach(async function () {
      await writeFile(testFilePath, Buffer.alloc(0));
      const form = new FormData();
      const knownLength = await stat(testFilePath).size;
      form.append('file', fs.createReadStream(testFilePath), { knownLength });

      headers = form.getHeaders();
      payload = await streamToPromise(form);
    });

    afterEach(async function () {
      await unlink(testFilePath);
    });

    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'importCertificationCandidatesFromCandidatesImportSheet').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const sessionId = 3;
      const url = `/api/sessions/${sessionId}/certification-candidates/import`;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when session ID params is not a number', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const sessionId = 'salut';
        const url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when session ID params is out of range for database integer (> 2147483647)', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const sessionId = 9999999999;
        const url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

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
    describe('GET /api/admin/sessions/{id}', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'getJurySession').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions/123');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('GET /api/admin/sessions', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'findPaginatedFilteredJurySessions').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

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

  describe('GET /api/sessions/{id}//candidates-import-sheet', function () {
    it('should return 200', async function () {
      // when
      sinon.stub(authorization, 'verifySessionAuthorization').resolves(true);
      sinon.stub(sessionController, 'getCandidatesImportSheet').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const auth = { credentials: { userId: 99 }, strategy: {} };

      const response = await httpTestServer.request('GET', '/api/sessions/3/candidates-import-sheet', {}, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 404 if the user is not authorized on the session', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());

      const auth = { credentials: { userId: 99 }, strategy: {} };
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', '/api/sessions/3/candidates-import-sheet', {}, auth);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});

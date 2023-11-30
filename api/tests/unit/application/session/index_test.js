import fs from 'fs';
import { writeFile, stat, unlink } from 'fs/promises';

import FormData from 'form-data';
import streamToPromise from 'stream-to-promise';
import { NotFoundError } from '../../../../lib/application/http-errors.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { sessionController } from '../../../../lib/application/sessions/session-controller.js';
import { sessionForSupervisingController } from '../../../../lib/application/sessions/session-for-supervising-controller.js';
import { sessionWithCleaCertifiedCandidateController } from '../../../../lib/application/sessions/session-with-clea-certified-candidate-controller.js';
import { finalizedSessionController } from '../../../../lib/application/sessions/finalized-session-controller.js';
import { authorization } from '../../../../lib/application/preHandlers/authorization.js';
import * as moduleUnderTest from '../../../../lib/application/sessions/index.js';
import { assessmentSupervisorAuthorization as sessionSupervisorAuthorization } from '../../../../lib/application/preHandlers/session-supervisor-authorization.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Unit | Application | Sessions | Routes', function () {
  describe('GET /api/sessions/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

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

  describe('GET /api/sessions/{id}/certification-candidates', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'getCertificationCandidates').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/sessions/{id}/certification-candidates/{certificationCandidateId}', function () {
    it('should return 404 if the user is not authorized on the session', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('DELETE', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'deleteCertificationCandidate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/sessions/3/certification-candidates/1');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return an error if certification candidate id is incorrect', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'deleteCertificationCandidate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/sessions/3/certification-candidates/ID');

      // then
      expect(response.statusCode).to.equal(400);
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

  describe('id validation', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/sessions/salut' } },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'GET', url: '/api/sessions/9999999999' },
      },
      { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/admin/sessions/salut' } },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'GET', url: '/api/admin/sessions/9999999999' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'GET', url: '/api/sessions/salut/certification-candidates' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'GET', url: '/api/sessions/9999999999/certification-candidates' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'DELETE', url: '/api/sessions/salut/certification-candidates/1' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'DELETE', url: '/api/sessions/9999999999/certification-candidates/1' },
      },
      {
        condition: 'certification candidate ID params is not a number',
        request: { method: 'DELETE', url: '/api/sessions/1/certification-candidates/salut' },
      },
      {
        condition: 'certification candidate ID params is out of range for database integer (> 2147483647)',
        request: { method: 'DELETE', url: '/api/sessions/1/certification-candidates/9999999999' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'GET', url: '/api/admin/sessions/salut/jury-certification-summaries' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'GET', url: '/api/admin/sessions/9999999999/jury-certification-summaries' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'POST', url: '/api/sessions/salut/candidate-participation' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'POST', url: '/api/sessions/9999999999/candidate-participation' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'PATCH', url: '/api/admin/sessions/salut/publish' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'PATCH', url: '/api/admin/sessions/salut/unpublish' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/publish' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/unpublish' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'PUT', url: '/api/admin/sessions/salut/results-sent-to-prescriber' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PUT', url: '/api/admin/sessions/9999999999/results-sent-to-prescriber' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'PATCH', url: '/api/admin/sessions/salut/certification-officer-assignment' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/certification-officer-assignment' },
      },
      {
        condition: 'session ID params is not a number',
        request: { method: 'GET', url: '/api/sessions/hello/certified-clea-candidate-data' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'GET', url: '/api/sessions/9999999999/certified-clea-candidate-data' },
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

  describe('PUT /api/session/{id}/enrol-students-to-session', function () {
    it('exists', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'enrolStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enrol-students-to-session');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('validates the session id', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'enrolStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/invalidId/enrol-students-to-session');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('denies access if the session of the logged used is not authorized', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
      sinon.stub(sessionController, 'enrolStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enrol-students-to-session');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/sessions/{id}/supervising', function () {
    it('should return 200 if the user is a supervisor of the session', async function () {
      //given
      sinon.stub(sessionSupervisorAuthorization, 'verifyBySessionId').callsFake((request, h) => h.response(true));
      sinon.stub(sessionForSupervisingController, 'get').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/supervising');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 401 if the user is not a supervisor of the session', async function () {
      //given
      sinon
        .stub(sessionSupervisorAuthorization, 'verifyBySessionId')
        .callsFake((request, h) => h.response().code(401).takeover());
      sinon.stub(sessionForSupervisingController, 'get').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/supervising');

      // then
      expect(response.statusCode).to.equal(401);
    });
  });

  describe('For admin', function () {
    describe('GET /api/admin/sessions/{id}', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
        const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/unpublish');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('POST /api/admin/sessions/publish-in-batch', function () {
      it('is protected by a pre-handler checking authorization to access Pix Admin', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
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
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
        const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/results-sent-to-prescriber');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('PATCH /api/admin/sessions/{id}/certification-officer-assignment', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'assignCertificationOfficer').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'PATCH',
          '/api/admin/sessions/1/certification-officer-assignment',
        );

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
        const response = await httpTestServer.request(
          'PATCH',
          '/api/admin/sessions/1/certification-officer-assignment',
        );

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('GET /api/admin/sessions/to-publish', function () {
      it('exists', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
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
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
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
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sessions/with-required-action');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('PUT /api/admin/sessions/{id}/comment', function () {
      it('should exist', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'commentAsJury').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/comment');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('is protected by a prehandler checking the SUPER_ADMIN role', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/comment');

        // then
        expect(response.statusCode).to.equal(403);
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
        const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/comment');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('DELETE /api/admin/sessions/{id}/comment', function () {
      it('should call appropriate use case and ensure user has access to Pix Admin', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(sessionController, 'deleteJuryComment').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('DELETE', '/api/admin/sessions/1/comment');

        // then
        expect(securityPreHandlers.adminMemberHasAtLeastOneAccessOf).to.be.calledOnce;
        expect(sessionController.deleteJuryComment).to.be.calledOnce;
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
        const response = await httpTestServer.request('DELETE', '/api/admin/sessions/1/comment');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('GET /api/admin/sessions/{id}/generate-results-download-link', function () {
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

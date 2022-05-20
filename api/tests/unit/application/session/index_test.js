const { writeFile, stat, unlink } = require('fs').promises;
const fs = require('fs');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');
const { NotFoundError } = require('../../../../lib/application/http-errors');

const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const sessionForSupervisingController = require('../../../../lib/application/sessions/session-for-supervising-controller');
const finalizedSessionController = require('../../../../lib/application/sessions/finalized-session-controller');
const authorization = require('../../../../lib/application/preHandlers/authorization');
const moduleUnderTest = require('../../../../lib/application/sessions');
const endTestScreenRemovalEnabled = require('../../../../lib/application/preHandlers/end-test-screen-removal-enabled');
const sessionSupervisorAuthorization = require('../../../../lib/application/preHandlers/session-supervisor-authorization');

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

  describe('GET /api/admin/sessions/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
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
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'findPaginatedFilteredJurySessions').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/session', function () {
    it('should exist', async function () {
      // given
      sinon.stub(sessionController, 'save').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      /// when
      const response = await httpTestServer.request('POST', '/api/sessions');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions/{id}/attendance-sheet', function () {
    it('should exist', async function () {
      // given
      sinon.stub(sessionController, 'getAttendanceSheet').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/1/attendance-sheet');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/sessions/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'update').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/sessions/1');

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

  describe('POST /api/sessions/{id}/certification-candidates', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'addCertificationCandidate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/sessions/{id}/certification-candidates/{certificationCandidateId}', function () {
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
  });

  describe('GET /api/admin/sessions/{id}/jury-certification-summaries', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'getJuryCertificationSummaries').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/1/jury-certification-summaries');

      // then
      expect(response.statusCode).to.equal(200);
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

  describe('PUT /api/sessions/{id}/finalization', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'finalize').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/finalization');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/admin/sessions/{id}/publish', function () {
    it('should exist', async function () {
      // given
      sinon.stub(sessionController, 'publish').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').resolves(true);
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
      sinon.stub(sessionController, 'publish').returns('ok');

      sinon.stub(securityPreHandlers, 'checkUserHasRoleMetier').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleCertif')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

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
      sinon.assert.notCalled(sessionController.publish);
    });
  });

  describe('PATCH /api/admin/sessions/{id}/unpublish', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'unpublish').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          attributes: {
            toPublish: true,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/unpublish', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/sessions/publish-in-batch', function () {
    it('is protected by a pre-handler checking authorization to access Pix Admin', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
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

    it('should succeed with valid session ids', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
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
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'flagResultsAsSentToPrescriber').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('PUT', '/api/admin/sessions/3/results-sent-to-prescriber');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/sessions/{id}/supervisor-kit', function () {
    it('should return 200', async function () {
      // when
      sinon.stub(sessionController, 'getSupervisorKitPdf').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', '/api/sessions/3/supervisor-kit');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/admin/sessions/{id}/certification-officer-assignment', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'assignCertificationOfficer').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/certification-officer-assignment');

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
        request: { method: 'GET', url: '/api/sessions/salut/attendance-sheet' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'GET', url: '/api/sessions/9999999999/attendance-sheet' },
      },
      { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/sessions/salut' } },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PATCH', url: '/api/sessions/9999999999' },
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
        request: { method: 'POST', url: '/api/sessions/salut/certification-candidates' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'POST', url: '/api/sessions/9999999999/certification-candidates' },
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
        request: { method: 'PUT', url: '/api/sessions/salut/finalization' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PUT', url: '/api/sessions/9999999999/finalization' },
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

  describe('PUT /api/session/{id}/enroll-students-to-session', function () {
    it('exists', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'enrollStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enroll-students-to-session');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('validates the session id', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'enrollStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/invalidId/enroll-students-to-session');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('denies access if the session of the logged used is not authorized', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
      sinon.stub(sessionController, 'enrollStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enroll-students-to-session');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/admin/sessions/to-publish', function () {
    it('exists', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
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
        .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
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
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
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
        .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
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
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
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
        .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
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
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'deleteJuryComment').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('DELETE', '/api/admin/sessions/1/comment');

      // then
      expect(securityPreHandlers.userHasAtLeastOneAccessOf).to.be.calledOnce;
      expect(sessionController.deleteJuryComment).to.be.calledOnce;
    });
  });

  describe('GET /api/sessions/{id}/supervising', function () {
    it('should return 200 if the user is a supervisor of the session and certification center is in the whitelist', async function () {
      //given
      sinon.stub(endTestScreenRemovalEnabled, 'verifyBySessionId').callsFake((request, h) => h.response(true));
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
      sinon.stub(endTestScreenRemovalEnabled, 'verifyBySessionId').callsFake((request, h) => h.response(true));
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

    it('should return 404 if the certification center is not in the whitelist', async function () {
      //given
      sinon
        .stub(endTestScreenRemovalEnabled, 'verifyBySessionId')
        .callsFake((request, h) => h.response().code(404).takeover());
      sinon.stub(sessionSupervisorAuthorization, 'verifyBySessionId').callsFake((request, h) => h.response(true));
      sinon.stub(sessionForSupervisingController, 'get').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/supervising');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});

import fs from 'fs';

const {
  promises
} = fs;

const {
  writeFile,
  stat,
  unlink,
} = promises;

import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { moduleUnderTest } from '../../../../lib/application/certification-centers.js';
import { certificationCenterController } from '../../../../lib/application/certification-centers/certification-center-controller.js';
import FormData from 'form-data';
import fs from 'fs';
import streamToPromise from 'stream-to-promise';

describe('Unit | Router | certification-center-router', function () {
  describe('POST /api/certification-centers/{certificationCenterId}/session', function () {
    it('should return CREATED (200) when everything does as expected', async function () {
      // given
      sinon.stub(certificationCenterController, 'saveSession').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter')
        .callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      /// when
      const response = await httpTestServer.request('POST', '/api/certification-centers/123/session');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async function () {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-centers/invalid/session');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 403 if user is not member of the given certification center', async function () {
      //given
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').callsFake((request, h) =>
        h
          .response({ errors: new Error('forbidden') })
          .code(403)
          .takeover()
      );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-centers/123/session');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/divisions', function () {
    it('should reject an invalid certification center id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/invalid/divisions');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students', function () {
    it('should reject unexpected filters ', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?filter[unexpected][]=5'
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a string array of one element as division filter ', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should accept a string array of several elements as division filter ', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject a division filter if it is not an array', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?filter[divisions]="3EMEA"'
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a pagination', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?page[number]=1&page[size]=25'
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject a page number which is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?page[number]=a'
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject a page size which is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?page[size]=a'
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept an empty query string', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/invalid/sessions/2/students');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject an invalid session id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/invalid/students');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/admin/certification-centers/{certificationCenterId}/certification-center-memberships', function () {
    const method = 'GET';
    const url = '/api/admin/certification-centers/1/certification-center-memberships';

    it('should exist', async function () {
      //given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(certificationCenterController, 'findCertificationCenterMembershipsByCertificationCenter')
        .returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async function () {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      const result = await httpTestServer.request(
        method,
        '/api/admin/certification-centers/invalid/certification-center-memberships'
      );

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('POST /api/admin/certification-centers/{certificationCenterId}/certification-center-memberships', function () {
    const method = 'POST';
    const url = '/api/admin/certification-centers/1/certification-center-memberships';
    const email = 'user@example.net';
    const payload = { email };

    it('should return CREATED (200) when everything does as expected', async function () {
      //given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCenterController, 'createCertificationCenterMembershipByEmail').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async function () {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        method,
        '/api/admin/certification-centers/invalid/certification-center-memberships'
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject an invalid email', async function () {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      payload.email = 'invalid email';

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/session-summaries', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(certificationCenterController, 'findPaginatedSessionSummaries').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-centers/123/session-summaries');

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(certificationCenterController.findPaginatedSessionSummaries);
    });
  });

  describe('POST /api/certification-centers/{certificationCenterId}/sessions/validate-for-mass-import', function () {
    const testFilePath = `${__dirname}/testFile_temp.csv`;

    let headers;
    let payload;

    beforeEach(async function () {
      await writeFile(testFilePath, Buffer.alloc(0));
      const form = new FormData();
      const { size: knownLength } = await stat(testFilePath);
      form.append('file', fs.createReadStream(testFilePath), { knownLength });

      headers = form.getHeaders();
      payload = await streamToPromise(form);
    });

    afterEach(async function () {
      await unlink(testFilePath);
    });

    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').callsFake((_, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkCertificationCenterIsNotScoManagingStudents')
        .callsFake((_request, h) => h.response(true));
      sinon.stub(certificationCenterController, 'validateSessionsForMassImport').returns('ok');
      const certificationCenterId = 123;
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'POST',
        `/api/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`,
        payload,
        null,
        headers
      );

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is member of a certification center from a sco organization managing student', function () {
      it('should forbid access', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').callsFake((_, h) => h.response(true));
        sinon.stub(securityPreHandlers, 'checkCertificationCenterIsNotScoManagingStudents').callsFake((_request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
        sinon.stub(certificationCenterController, 'validateSessionsForMassImport').returns('ok');
        const certificationCenterId = 123;
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'POST',
          `/api/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`,
          payload,
          null,
          headers
        );

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/import', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').callsFake((_, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkCertificationCenterIsNotScoManagingStudents')
        .callsFake((_, h) => h.response(true));
      sinon.stub(certificationCenterController, 'getSessionsImportTemplate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-centers/123/import');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

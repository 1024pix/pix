import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';

import * as moduleUnderTest from '../../../../../src/certification/session/application/session-mass-import-route.js';
import { sessionMassImportController } from '../../../../../src/certification/session/application/session-mass-import-controller.js';
import FormData from 'form-data';
import fs from 'fs';
import { writeFile, stat, unlink } from 'fs/promises';
import streamToPromise from 'stream-to-promise';

import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Unit | Router | session-mass-import-route', function () {
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
      sinon.stub(sessionMassImportController, 'validateSessions').returns('ok');
      const certificationCenterId = 123;
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'POST',
        `/api/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`,
        payload,
        null,
        headers,
      );

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is member of the certification center', function () {
      context('when certification center is from a SCO organization managing student', function () {
        it('should forbid access', async function () {
          // given
          sinon
            .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter')
            .callsFake((_, h) => h.response(true));
          sinon
            .stub(securityPreHandlers, 'checkCertificationCenterIsNotScoManagingStudents')
            .callsFake((_request, h) => Promise.resolve(h.response().code(403).takeover()));
          sinon.stub(sessionMassImportController, 'validateSessions').returns('ok');
          const certificationCenterId = 123;
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(
            'POST',
            `/api/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`,
            payload,
            null,
            headers,
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when certification center is not from a SCO organization managing student', function () {
        it('should allow access', async function () {
          // given
          sinon
            .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter')
            .callsFake((_, h) => h.response(true));
          sinon
            .stub(securityPreHandlers, 'checkCertificationCenterIsNotScoManagingStudents')
            .callsFake((_request, h) => Promise.resolve(h.response().code(200).takeover()));
          sinon.stub(sessionMassImportController, 'validateSessions').returns('ok');
          const certificationCenterId = 123;
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(
            'POST',
            `/api/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`,
            payload,
            null,
            headers,
          );

          // then
          expect(response.statusCode).to.equal(200);
        });
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
      sinon.stub(sessionMassImportController, 'getSessionsImportTemplate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-centers/123/import');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

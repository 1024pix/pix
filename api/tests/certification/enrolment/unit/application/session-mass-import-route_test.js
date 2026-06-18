import FormData from 'form-data';
import sinon from 'sinon';

import { sessionMassImportController } from '../../../../../src/certification/enrolment/application/session-mass-import-controller.js';
import { sessionMassImportRoute as moduleUnderTest } from '../../../../../src/certification/enrolment/application/session-mass-import-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Router | session-mass-import-route', function () {
  describe('POST /api/certification-centers/{certificationCenterId}/sessions/validate-for-mass-import', function () {
    let headers;
    let payload;

    beforeEach(function () {
      const form = new FormData();
      form.append('file', Buffer.alloc(0), { filename: 'test-file' });
      headers = form.getHeaders();
      payload = form.getBuffer();
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
      sinon.stub(sessionMassImportController, 'getTemplate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-centers/123/import');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

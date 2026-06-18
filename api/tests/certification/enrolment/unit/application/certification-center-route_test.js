import sinon from 'sinon';

import { certificationCenterController } from '../../../../../src/certification/enrolment/application/certification-center-controller.js';
import { certificationCenterRoute as moduleUnderTest } from '../../../../../src/certification/enrolment/application/certification-center-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Enrolment | Unit | Application | Session Students Route', function () {
  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students', function () {
    it('should reject unexpected filters ', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?filter[unexpected][]=5',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a string array of one element as division filter ', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"',
      );

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should accept a string array of several elements as division filter ', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"',
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
        '/api/certification-centers/1/sessions/2/students?filter[divisions]="3EMEA"',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a pagination', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-centers/1/sessions/2/students?page[number]=1&page[size]=25',
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
        '/api/certification-centers/1/sessions/2/students?page[number]=a',
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
        '/api/certification-centers/1/sessions/2/students?page[size]=a',
      );

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept an empty query string', async function () {
      // given
      sinon.stub(certificationCenterController, 'getStudents').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').returns(() => true);
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
});

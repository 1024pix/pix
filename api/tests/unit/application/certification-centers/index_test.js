const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/certification-centers');

const CertificationCenterController = require('../../../../lib/application/certification-centers/certification-center-controller');

describe('Unit | Router | certification-center-router', function() {

  let httpTestServer;

  beforeEach(function() {
    sinon.stub(CertificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/certification-centers/{certificationCenterId}/divisions', function() {
    it('should reject an invalid certification center id', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/invalid/divisions');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students', function() {

    it('should reject unexpected filters ', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[unexpected][]=5');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a string array of one element as division filter ', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should accept a string array of several elements as division filter ', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject a division filter if it is not an array', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[divisions]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a pagination', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?page[number]=1&page[size]=25');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject a page number which is not a number', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?page[number]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject a page size which is not a number', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?page[size]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept an empty query string', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/invalid/sessions/2/students');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject an invalid session id', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/invalid/students');

      // then
      expect(result.statusCode).to.equal(400);
    });

  });

});

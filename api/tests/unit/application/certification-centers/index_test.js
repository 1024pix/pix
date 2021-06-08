const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/certification-centers');
const certificationCenterController = require('../../../../lib/application/certification-centers/certification-center-controller');

describe('Unit | Router | certification-center-router', () => {

  describe('GET /api/certification-centers/{certificationCenterId}/divisions', () => {

    it('should reject an invalid certification center id', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/invalid/divisions');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/sessions/{sessionId}/students', () => {

    it('should reject unexpected filters ', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[unexpected][]=5');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a string array of one element as division filter ', async () => {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should accept a string array of several elements as division filter ', async () => {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[divisions][]="3EMEB"&filter[divisions][]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject a division filter if it is not an array', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?filter[divisions]="3EMEA"');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept a pagination', async () => {
      // given
      sinon.stub(certificationCenterController, 'getStudents').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?page[number]=1&page[size]=25');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject a page number which is not a number', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?page[number]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject a page size which is not a number', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students?page[size]=a');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should accept an empty query string', async () => {
      // given
      sinon.stub(certificationCenterController, 'getStudents').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/2/students');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/invalid/sessions/2/students');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject an invalid session id', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/1/sessions/invalid/students');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/certification-center-memberships', () => {

    const method = 'GET';
    const url = '/api/certification-centers/1/certification-center-memberships';

    it('should exist', async () => {
      //given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').returns(true);
      sinon.stub(certificationCenterController, 'findCertificationCenterMembershipsByCertificationCenter').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async () => {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      const result = await httpTestServer.request(method, '/api/certification-centers/invalid/certification-center-memberships');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('POST /api/certification-centers/{certificationCenterId}/certification-center-memberships', () => {

    const method = 'POST';
    const url = '/api/certification-centers/1/certification-center-memberships';
    const email = 'user@example.net';
    const payload = { email };

    it('should return CREATED (200) when everything does as expected', async () => {
      //given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').returns(true);
      sinon.stub(certificationCenterController, 'createCertificationCenterMembershipByEmail').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should reject an user without PixMaster role', async () => {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(403);
    });

    it('should reject an invalid certification-centers id', async () => {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request(method, '/api/certification-centers/invalid/certification-center-memberships');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should reject an invalid email', async () => {
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

  describe('GET /api/certification-centers/{certificationCenterId}/session-summaries', () => {

    it('should return 200', async () => {
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
});

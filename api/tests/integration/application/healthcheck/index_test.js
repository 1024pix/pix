const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const moduleUnderTest = require('../../../../lib/application/healthcheck');
const healthCheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Integration | Application | Route | healthcheckRouter', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(healthCheckController, 'get').callsFake((request, h) => h.response(true));
    sinon.stub(healthCheckController, 'checkDbStatus').callsFake((request, h) => h.response(true));
    sinon.stub(healthCheckController, 'checkRedisStatus').callsFake((request, h) => h.response(true));
    sinon.stub(healthCheckController, 'crashTest').callsFake((request, h) => h.response(true));
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(healthCheckController.get).to.have.been.calledOnce;
    });
  });

  describe('GET /api/healthcheck/db', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/healthcheck/db';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(healthCheckController.checkDbStatus).to.have.been.calledOnce;
    });
  });

  describe('GET /api/healthcheck/redis', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/healthcheck/redis';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(healthCheckController.checkRedisStatus).to.have.been.calledOnce;
    });
  });

  describe('GET /api/healthcheck/crash', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/healthcheck/crash';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(healthCheckController.crashTest).to.have.been.calledOnce;
    });
  });

});

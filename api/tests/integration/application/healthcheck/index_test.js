import { expect, sinon, HttpTestServer } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/healthcheck';
import healthCheckController from '../../../../lib/application/healthcheck/healthcheck-controller';

describe('Integration | Application | Route | healthcheckRouter', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(healthCheckController, 'get').callsFake((request, h) => h.response(true));
    sinon.stub(healthCheckController, 'checkDbStatus').callsFake((request, h) => h.response(true));
    sinon.stub(healthCheckController, 'checkRedisStatus').callsFake((request, h) => h.response(true));
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api', function () {
    it('should exist', async function () {
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

  describe('GET /api/healthcheck/db', function () {
    it('should exist', async function () {
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

  describe('GET /api/healthcheck/redis', function () {
    it('should exist', async function () {
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
});

const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const moduleUnderTest = require('../../../../lib/application/healthcheck');
const healthCheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Integration | Application | Route | healthcheckRouter', () => {

  beforeEach(() => {
    sinon.stub(healthCheckController, 'checkRedisStatus').callsFake((request, h) => h.response(true));
    this.httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/healthcheck/redis', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/healthcheck/redis';

      // when
      const response = await this.httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(healthCheckController.checkRedisStatus).to.have.been.calledOnce;
    });
  });

});

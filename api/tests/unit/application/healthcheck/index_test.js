const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/healthcheck');

const healthcheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Unit | Router | HealthcheckRouter', function() {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(healthcheckController, 'get').returns('ok');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api', function() {

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request('GET', '/api');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

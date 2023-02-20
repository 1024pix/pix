import { expect, HttpTestServer, sinon } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/healthcheck';
import healthcheckController from '../../../../lib/application/healthcheck/healthcheck-controller';

describe('Unit | Router | HealthcheckRouter', function () {
  describe('GET /api', function () {
    it('should exist', async function () {
      // given
      sinon.stub(healthcheckController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

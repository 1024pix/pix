import sinon from 'sinon';

import { healthcheckController } from '../../../../../src/shared/application/healthcheck/healthcheck-controller.js';
import { healthcheckRoute as moduleUnderTest } from '../../../../../src/shared/application/healthcheck/index.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

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

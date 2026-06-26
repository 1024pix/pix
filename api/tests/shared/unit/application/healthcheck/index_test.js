import sinon from 'sinon';

import { healthcheckController } from '../../../../../src/shared/application/healthcheck/healthcheck-controller.js';
import { healthcheckRoute as moduleUnderTest } from '../../../../../src/shared/application/healthcheck/index.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Router | HealthcheckRouter', function () {
  describe('GET /api', function () {
    it('should exist', async function () {
      // given
      sinon.stub(healthcheckController, 'get').returns('ok');
      sinon.stub(featureToggles, 'get').resolves(false);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/healthcheck/os', function () {
    it('should not exist when feature toggle is disabled', async function () {
      // given
      sinon.stub(featureToggles, 'get').resolves(false);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/healthcheck/os');

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should exist when feature toggle is enabled', async function () {
      // given
      sinon.stub(featureToggles, 'get').resolves(true);
      sinon.stub(healthcheckController, 'checkOsStatus').returns({ type: 'Linux' });
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/healthcheck/os');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

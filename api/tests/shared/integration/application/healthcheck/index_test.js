import sinon from 'sinon';

import { healthcheckController as healthCheckController } from '../../../../../src/shared/application/healthcheck/healthcheck-controller.js';
import { healthcheckRoute as moduleUnderTest } from '../../../../../src/shared/application/healthcheck/index.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

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

  describe('GET /api/healthcheck/forwarded-origin', function () {
    context('when forwarded origin is not obtained', function () {
      it('returns an HTTP status code 500', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/healthcheck/forwarded-origin',
          headers: {
            'x-forwarded-proto': 'https',
            'x-forwarded-host-is-missing': 'there is a problem with the nginx configuration',
          },
        };

        // when
        const response = await httpTestServer.requestObject(options);

        // then
        expect(response.statusCode).to.equal(500);
        expect(response.result).to.equal('Obtaining Forwarded Origin failed');
      });
    });
  });
});

import sinon from 'sinon';

import { healthcheckController } from '../../../../../src/shared/application/healthcheck/healthcheck-controller.js';
import { redisMonitor } from '../../../../../src/shared/infrastructure/utils/redis-monitor.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Controller | healthcheckController', function () {
  describe('#get', function () {
    it('should reply with the API description', async function () {
      // given / when
      const response = await healthcheckController.get({}, hFake);

      // then
      expect(response).to.include.keys('name', 'version', 'description');
      expect(response['name']).to.equal('pix-api');
      expect(response['description']).to.equal(
        "Plateforme d'évaluation et de certification des compétences numériques",
      );
      expect(response['environment']).to.equal('test');
      expect(response['current-lang']).to.equal('fr');
    });
  });

  describe('#checkRedisStatus', function () {
    beforeEach(function () {
      sinon.stub(redisMonitor, 'ping');
    });

    it('should check if Redis connection is successful', async function () {
      // given
      redisMonitor.ping.resolves();

      // when
      const response = await healthcheckController.checkRedisStatus();

      // then
      expect(response).to.include.keys('message');
      expect(response['message']).to.equal('Connection to Redis ok');
    });

    it('should reply with a 503 error when the connection with Redis is KO', function () {
      // given
      redisMonitor.ping.rejects();

      // when
      const promise = healthcheckController.checkRedisStatus(null, hFake);

      // then
      return expect(promise)
        .to.be.eventually.rejectedWith(/Connection to Redis failed/)
        .and.have.nested.property('output.statusCode', 503);
    });
  });

  describe('#checkOsStatus', function () {
    it('should reply with OS information', function () {
      // when
      const response = healthcheckController.checkOsStatus();

      // then
      expect(response).to.include.keys('type', 'version', 'platform', 'release', 'arch');
    });
  });
});

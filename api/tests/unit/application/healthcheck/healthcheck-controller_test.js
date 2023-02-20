import { expect, sinon, hFake } from '../../../test-helper';
import { knex } from '../../../../db/knex-database-connection';
import redisMonitor from '../../../../lib/infrastructure/utils/redis-monitor';
import healthcheckController from '../../../../lib/application/healthcheck/healthcheck-controller';

describe('Unit | Controller | healthcheckController', function () {
  describe('#get', function () {
    it('should reply with the API description', async function () {
      // when
      const mockedRequest = { i18n: { __: sinon.stub() } };

      const response = await healthcheckController.get(mockedRequest, hFake);

      // then
      expect(response).to.include.keys('name', 'version', 'description');
      expect(response['name']).to.equal('pix-api');
      expect(response['description']).to.equal(
        "Plateforme d'évaluation et de certification des compétences numériques"
      );
      expect(response['environment']).to.equal('test');
    });
  });

  describe('#checkDbStatus', function () {
    beforeEach(function () {
      sinon.stub(knex, 'raw');
    });

    it('should check if DB connection is successful', async function () {
      // given
      knex.raw.resolves();

      // when
      const response = await healthcheckController.checkDbStatus();

      // then
      expect(response).to.include.keys('message');
      expect(response['message']).to.equal('Connection to database ok');
    });

    it('should reply with a 503 error when the connection with the database is KO', function () {
      // given
      knex.raw.rejects();

      // when
      const promise = healthcheckController.checkDbStatus(null, hFake);

      // then
      expect(promise).to.be.rejectedWith(/Connection to database failed/);
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
});

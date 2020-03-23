const { expect, sinon, hFake } = require('../../../test-helper');
const { knex } = require('../../../../db/knex-database-connection');
const redisMonitor = require('../../../../lib/infrastructure/utils/redis-monitor');

const healthcheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Unit | Controller | healthcheckController', () => {

  describe('#get', () => {

    it('should reply with the API description', async function() {
      // when
      const response = await healthcheckController.get(null, hFake);

      // then
      expect(response).to.include.keys('name', 'version', 'description');
      expect(response['name']).to.equal('pix-api');
      expect(response['description']).to.equal('Plateforme d\'évaluation et de certification des compétences numériques à l\'usage de tous les citoyens francophones');
      expect(response['environment']).to.equal('test');
    });
  });

  describe('#checkDbStatus', () => {

    beforeEach(() => {
      sinon.stub(knex, 'raw');
    });

    it('should check if DB connection is successful', async () => {
      // given
      knex.raw.resolves();

      // when
      const response = await healthcheckController.checkDbStatus();

      // then
      expect(response).to.include.keys('message');
      expect(response['message']).to.equal('Connection to database ok');
    });

    it('should reply with a 503 error when the connection with the database is KO', () => {
      // given
      knex.raw.rejects();

      // when
      const promise = healthcheckController.checkDbStatus(null, hFake);

      // then
      expect(promise).to.be.rejectedWith(/Connection to database failed/);
    });
  });

  describe('#checkRedisStatus', () => {

    beforeEach(() => {
      sinon.stub(redisMonitor, 'ping');
    });

    it('should check if Redis connection is successful', async () => {
      // given
      redisMonitor.ping.resolves();

      // when
      const response = await healthcheckController.checkRedisStatus();

      // then
      expect(response).to.include.keys('message');
      expect(response['message']).to.equal('Connection to Redis ok');
    });

    it('should reply with a 503 error when the connection with Redis is KO', () => {
      // given
      redisMonitor.ping.rejects();

      // when
      const promise = healthcheckController.checkRedisStatus(null, hFake);

      // then
      return expect(promise).to.be.eventually.rejectedWith(/Connection to Redis failed/)
        .and.have.nested.property('output.statusCode', 503);
    });
  });
});

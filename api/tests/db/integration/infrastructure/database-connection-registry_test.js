import sinon from 'sinon';

import datamartKnexConfigs from '../../../../datamart/knexfile.js';
import { DatabaseConnection } from '../../../../db/database-connection.js';
import { DatabaseConnectionRegistry } from '../../../../db/database-connection-registry.js';
import liveKnexConfigs from '../../../../db/knexfile.js';
import { config } from '../../../../src/shared/config.js';
import { expect } from '../../../test-helper.js';

const { environment } = config;

function buildApiConnection() {
  return new DatabaseConnection(liveKnexConfigs[environment]);
}

function buildDatamartConnection() {
  return new DatabaseConnection(datamartKnexConfigs[environment]);
}

function buildUnreachableConnection() {
  return new DatabaseConnection({
    name: 'unreachable',
    client: 'postgresql',
    connection: {
      connectionString: 'postgres://user:password@localhost:1/unreachable_database',
    },
    acquireConnectionTimeout: 1000,
    pool: { min: 0, max: 1 },
  });
}

function buildNotConfiguredConnection() {
  return new DatabaseConnection({
    name: 'datawarehouse',
    client: 'postgresql',
    connection: {
      connectionString: undefined,
    },
  });
}

describe('Integration | Infrastructure | database-connection-registry', function () {
  let registries;

  beforeEach(function () {
    registries = [];
  });

  afterEach(async function () {
    await Promise.allSettled(registries.map((registry) => registry.disconnect()));
  });

  function buildRegistry(connections) {
    const registry = new DatabaseConnectionRegistry(connections);
    registries.push(registry);
    return registry;
  }

  describe('#get', function () {
    it('should return the connection registered under the given name', function () {
      // given
      const apiConnection = buildApiConnection();
      const registry = buildRegistry({ api: apiConnection });

      // when / then
      expect(registry.get('api')).to.equal(apiConnection);
    });

    it('should throw on an unknown connection name', function () {
      // given
      const registry = buildRegistry({ api: buildApiConnection(), datamart: buildDatamartConnection() });

      // when / then
      expect(() => registry.get('nope')).to.throw(
        'Unknown database connection "nope". Available connections are: api, datamart.',
      );
    });
  });

  describe('#initialize', function () {
    it('should warm up the declared required connections', async function () {
      // given
      const registry = buildRegistry({ api: buildApiConnection(), datamart: buildDatamartConnection() });

      // when / then
      await expect(registry.initialize(['api', 'datamart'])).to.be.fulfilled;
    });

    it('should reject when a required connection is not configured', async function () {
      // given
      const registry = buildRegistry({ api: buildApiConnection(), datawarehouse: buildNotConfiguredConnection() });

      // when / then
      await expect(registry.initialize(['api', 'datawarehouse'])).to.be.rejectedWith(
        'Database "datawarehouse" is not configured. Missing environment variable.',
      );
    });

    it('should reject on an unknown connection name', async function () {
      // given
      const registry = buildRegistry({ api: buildApiConnection() });

      // when / then
      await expect(registry.initialize(['nope'])).to.be.rejectedWith('Unknown database connection "nope".');
    });
  });

  describe('#checkStatuses', function () {
    it('should check every configured connection', async function () {
      // given
      const registry = buildRegistry({
        api: buildApiConnection(),
        unreachable: buildUnreachableConnection(),
      });

      // when / then
      await expect(registry.checkStatuses()).to.be.rejectedWith('Connection to database unreachable not available.');
    });

    it('should ignore connections that are not configured', async function () {
      // given
      const registry = buildRegistry({
        api: buildApiConnection(),
        datawarehouse: buildNotConfiguredConnection(),
      });

      // when / then
      await expect(registry.checkStatuses()).to.be.fulfilled;
    });
  });

  describe('#disconnect', function () {
    it('should close all connections and be terminal', async function () {
      // given
      const registry = buildRegistry({ api: buildApiConnection(), datamart: buildDatamartConnection() });
      await registry.get('api').knex.raw('SELECT 1');
      await registry.get('datamart').knex.raw('SELECT 1');

      // when
      await registry.disconnect();

      // then
      await expect(registry.get('api').knex.raw('SELECT 1')).to.be.rejected;
      await expect(registry.get('datamart').knex.raw('SELECT 1')).to.be.rejected;
    });

    it('should be idempotent when called twice', async function () {
      // given
      const registry = buildRegistry({ api: buildApiConnection() });

      // when / then
      await expect(registry.disconnect()).to.be.fulfilled;
      await expect(registry.disconnect()).to.be.fulfilled;
    });

    it('should make concurrent calls await the in-flight closure and close connections only once', async function () {
      // given
      const connection = buildApiConnection();
      const disconnectSpy = sinon.spy(connection, 'disconnect');
      const registry = buildRegistry({ api: connection });

      // when
      await Promise.all([registry.disconnect(), registry.disconnect()]);

      // then
      expect(disconnectSpy).to.have.been.calledOnce;
      await expect(registry.get('api').knex.raw('SELECT 1')).to.be.rejected;
    });

    it('should close all connections even when one fails and aggregate the errors', async function () {
      // given
      const failingConnection = buildApiConnection();
      sinon.stub(failingConnection, 'disconnect').rejects(new Error('Closing failure'));
      const otherConnection = buildDatamartConnection();
      const otherDisconnectSpy = sinon.spy(otherConnection, 'disconnect');
      const registry = buildRegistry({ api: failingConnection, datamart: otherConnection });

      // when
      let error;
      try {
        await registry.disconnect();
      } catch (err) {
        error = err;
      }

      // then
      expect(error).to.be.an.instanceOf(AggregateError);
      expect(error.message).to.equal('Some database connections failed to close properly.');
      expect(error.errors).to.have.lengthOf(1);
      expect(error.errors[0].message).to.equal('Closing failure');
      expect(otherDisconnectSpy).to.have.been.calledOnce;

      // and disconnect stays a no-op afterwards
      await expect(registry.disconnect()).to.be.fulfilled;
    });
  });

  describe('#getPoolMetrics', function () {
    it('should cover all configured connections', function () {
      // given
      const registry = buildRegistry({
        api: buildApiConnection(),
        datamart: buildDatamartConnection(),
        datawarehouse: buildNotConfiguredConnection(),
      });

      // when
      const metrics = registry.getPoolMetrics();

      // then
      expect(metrics.pools).to.have.keys(['live', 'datamart']);
      expect(metrics.pools.live).to.include.keys(['used', 'free', 'pendingAcquires', 'pendingCreates', 'min', 'max']);
    });
  });
});

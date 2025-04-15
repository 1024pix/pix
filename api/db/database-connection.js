import { performance } from 'node:perf_hooks';

import Knex from 'knex';
import _ from 'lodash';

import { config } from '../src/shared/config.js';
import { monitoringTools } from '../src/shared/infrastructure/monitoring-tools.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';
import { configureConnectionExtension } from './knex-extensions.js';

const { logging } = config;

export class DatabaseConnection {
  knex;
  #name;

  static databaseUrlFromConfig(knexConfig) {
    return new URL(knexConfig.connection);
  }

  constructor(knexConfig) {
    this.knex = Knex(knexConfig);
    this.#name = knexConfig.name;
    this.knex.on('query', function (data) {
      if (logging.enableKnexPerformanceMonitoring) {
        const queryId = data.__knexQueryUid;
        monitoringTools.setInContext(`knexQueryStartTimes.${queryId}`, performance.now());
      }
    });

    this.knex.on('query-response', function (response, data) {
      monitoringTools.incrementInContext('metrics.knexQueryCount');
      if (logging.enableKnexPerformanceMonitoring) {
        const queryStartedTime = monitoringTools.getInContext(`knexQueryStartTimes.${data.__knexQueryUid}`);
        if (queryStartedTime) {
          const duration = performance.now() - queryStartedTime;
          monitoringTools.incrementInContext('metrics.knexTotalTimeSpent', duration);
        }
      }
    });

    configureConnectionExtension(this.knex);
  }

  async checkStatus() {
    try {
      await this.knex.raw('SELECT 1');
    } catch (cause) {
      throw new Error(`Connection to database ${this.#name} not available.`, { cause });
    }
  }

  async prepare() {
    await this.checkStatus();
    logger.info(`Connection to database ${this.#name} established.`);
  }

  async disconnect() {
    await this.knex.destroy();
    logger.info(`Closing connections to ${this.#name}`);
  }

  async emptyAllTables() {
    const tableNames = await this.#listAllTableNames();
    const tablesToDelete = _.without(
      tableNames,
      'knex_migrations',
      'knex_migrations_lock',
      'view-active-organization-learners',
    );

    const tables = _.map(tablesToDelete, (tableToDelete) => `"${tableToDelete}"`).join();

    // eslint-disable-next-line knex/avoid-injections
    return this.knex.raw(`TRUNCATE ${tables}`);
  }

  async #listAllTableNames() {
    const resultSet = await this.knex.raw(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
      [this.knex.client.database()],
    );

    const rows = resultSet.rows;
    return _.map(rows, 'table_name');
  }

  getPoolMetrics() {
    if (!this.knex.client.pool) {
      return {};
    }

    return {
      [this.#name]: {
        used: this.knex.client.pool.numUsed(),
        free: this.knex.client.pool.numFree(),
        pendingAcquires: this.knex.client.pool.numPendingAcquires(),
        pendingCreates: this.knex.client.pool.numPendingCreates(),
        min: this.knex.client.pool.min,
        max: this.knex.client.pool.max,
      },
    };
  }
}

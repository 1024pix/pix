import { performance } from 'node:perf_hooks';

import Knex from 'knex';
import _ from 'lodash';

import { config } from '../src/shared/config.js';
import {
  getInContext,
  incrementInContext,
  setInContext,
} from '../src/shared/infrastructure/execution-context-manager.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';
import { configureConnectionExtension, disableTypeCastingForJsonTypes } from './knex-extensions.js';

const { logging } = config;

export class DatabaseConnection {
  knex;
  #name;
  #hasConnection;

  static databaseUrlFromConfig(knexConfig) {
    return knexConfig?.connection?.connectionString ? new URL(knexConfig.connection.connectionString) : null;
  }

  constructor(knexConfig) {
    this.#hasConnection = Boolean(knexConfig?.connection?.connectionString);
    if (this.#hasConnection) {
      if (knexConfig?.customFlags?.disableJsonTypesParsing) {
        disableTypeCastingForJsonTypes(knexConfig);
      }
      this.knex = Knex(knexConfig);
      this.#name = knexConfig.name;
      const url = DatabaseConnection.databaseUrlFromConfig(knexConfig);
      this.knex.__pix__database = url.pathname.slice(1);
      this.knex.on('query', function (data) {
        if (logging.enableKnexPerformanceMonitoring) {
          const queryId = data.__knexQueryUid;
          setInContext(`knexQueryStartTimes.${queryId}`, performance.now());
        }
      });

      this.knex.on('query-response', function (response, data) {
        incrementInContext('metrics.knexQueryCount');
        if (logging.enableKnexPerformanceMonitoring) {
          const queryStartedTime = getInContext(`knexQueryStartTimes.${data.__knexQueryUid}`);
          if (queryStartedTime) {
            const duration = performance.now() - queryStartedTime;
            incrementInContext('metrics.knexTotalTimeSpent', duration);
          }
        }
      });

      configureConnectionExtension(this.knex);
    } else {
      logger.error('Database connection not found');
    }
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
    if (this.#hasConnection) {
      await this.knex.destroy();
      logger.info(`Closing connections to ${this.#name}`);
    }
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
      [this.knex.__pix__database],
    );

    const rows = resultSet.rows;
    return _.map(rows, 'table_name');
  }

  getPoolMetrics() {
    if (!this.#hasConnection) {
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

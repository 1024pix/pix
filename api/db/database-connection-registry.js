import datamartKnexConfigs from '../datamart/knexfile.js';
import datawarehouseKnexConfigs from '../datawarehouse/knexfile.js';
import { config } from '../src/shared/config.js';
import { DatabaseConnection } from './database-connection.js';
import { configureGlobalExtensions } from './knex-extensions.js';
import { knexConfigWithPgBouncer } from './knexfile.js';

configureGlobalExtensions();

export class DatabaseConnectionRegistry {
  #connections;
  #disconnectPromise = null;

  constructor(connections) {
    this.#connections = connections;
  }

  get(name) {
    const connection = this.#connections[name];
    if (!connection) {
      throw new Error(
        `Unknown database connection "${name}". Available connections are: ${Object.keys(this.#connections).join(', ')}.`,
      );
    }
    return connection;
  }

  async initialize(requiredConnectionNames) {
    const connections = requiredConnectionNames.map((name) => this.get(name));
    await Promise.all(connections.map((connection) => connection.prepare()));
  }

  async checkStatuses() {
    const connections = Object.values(this.#connections).filter((connection) => connection.isConfigured);
    return Promise.all(connections.map((connection) => connection.checkStatus()));
  }

  async connect() {
    this.#connections = buildConnections();
  }

  async disconnect() {
    if (this.#disconnectPromise) {
      await Promise.allSettled([this.#disconnectPromise]);
      return;
    }
    this.#disconnectPromise = this.#disconnectAll();
    return this.#disconnectPromise;
  }

  async #disconnectAll() {
    const results = await Promise.allSettled(
      Object.values(this.#connections).map((connection) => connection.disconnect()),
    );
    const errors = results.filter(({ status }) => status === 'rejected').map(({ reason }) => reason);
    if (errors.length > 0) {
      throw new AggregateError(errors, 'Some database connections failed to close properly.');
    }
  }

  getPoolMetrics() {
    const pools = Object.values(this.#connections).reduce((acc, connection) => {
      return { ...acc, ...connection.getPoolMetrics() };
    }, {});
    return { pools };
  }
}

const { environment } = config;

function buildConnections() {
  return {
    api: new DatabaseConnection(knexConfigWithPgBouncer[environment]),
    datamart: new DatabaseConnection(datamartKnexConfigs[environment]),
    datawarehouse: new DatabaseConnection(datawarehouseKnexConfigs[environment]),
  };
}

export const databaseConnectionRegistry = new DatabaseConnectionRegistry(buildConnections());

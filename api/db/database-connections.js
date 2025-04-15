import { configureGlobalExtensions } from './knex-extensions.js';

class DatabaseConnections {
  #connections = [];

  constructor() {
    configureGlobalExtensions();
  }

  addConnection(connection) {
    this.#connections.push(connection);
  }

  async disconnect() {
    return Promise.all(this.#connections.map((connection) => connection.disconnect()));
  }

  async checkStatuses() {
    return Promise.all(this.#connections.map((connection) => connection.checkStatus()));
  }

  getPoolMetrics() {
    const pools = this.#connections.reduce((acc, current) => {
      return { ...acc, ...current.getPoolMetrics() };
    }, {});
    return { pools };
  }
}

export const databaseConnections = new DatabaseConnections();

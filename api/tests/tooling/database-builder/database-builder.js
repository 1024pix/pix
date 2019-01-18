const _ = require('lodash');

const databaseBuffer = require('./database-buffer');
const factory = require('./factory/index');

module.exports = class DatabaseBuilder {
  constructor({ knex }) {
    this.knex = knex;
    this.databaseBuffer = databaseBuffer;
    this.factory = factory;

    this.databaseName = knex.client.database();
    const clientName = knex.schema.client.config.client;
    this.isSQLite = clientName === 'sqlite3';

    const queries = _dbSpecificQueries[clientName];
    this.listTablesQuery = queries.listTablesQuery;
    this.truncateTableQuery = queries.truncateTableQuery;
  }

  commit() {
    const initialPromise = Promise.resolve();

    return this.databaseBuffer.objectsToInsert.reduce((promise, objectToInsert) => {

      return promise
        .then(() => this.knex(objectToInsert.tableName).insert(objectToInsert.values));

    }, initialPromise);
  }

  clean() {
    const initialPromise = Promise.resolve();

    return this.databaseBuffer.objectsToInsert.reduce((promise, objectToInsert) => {

      return promise
        .then(() => this.knex(objectToInsert.tableName).delete());

    }, initialPromise)
      .then(() => {
        this.databaseBuffer.purge();
      });
  }

  async listAllTableNames() {
    const bindings = this.isSQLite ? undefined : [this.databaseName];
    const resultSet = await this.knex.raw(this.listTablesQuery, bindings);

    const rows = this.isSQLite ? resultSet : resultSet.rows;
    return _.map(rows, 'table_name');
  }

  async clearAllTables() {
    const tableNames = await this.listAllTableNames();
    const tablesToDelete = _.without(tableNames,
      'knex_migrations',
      'knex_migrations_lock',
      'sqlite_sequence'
    );

    for(const tableName of tablesToDelete) {
      await this.knex.raw(this.truncateTableQuery, [tableName]);
    }
  }

};

const _dbSpecificQueries = {
  postgresql: {
    listTablesQuery: 'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
    truncateTableQuery: 'TRUNCATE TABLE ?? CASCADE;'
  },

  sqlite3: {
    listTablesQuery: 'SELECT name AS table_name FROM sqlite_master WHERE type=\'table\'',
    truncateTableQuery: 'DELETE FROM ??;'
  }
};

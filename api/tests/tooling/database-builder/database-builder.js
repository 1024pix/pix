const databaseBuffer = require('./database-buffer');
const factory = require('./factory/index');
const knexDatabaseConnection = require('../../../db/knex-database-connection');

module.exports = class DatabaseBuilder {
  constructor({ knex }) {
    this.knex = knex;
    this.databaseBuffer = databaseBuffer;
    this.factory = factory;
    this.isFirstCommit = true;
  }

  async commit() {
    if (this.isFirstCommit) {
      await knexDatabaseConnection.emptyAllTables();
      this.isFirstCommit = false;
    }
    for (const objectToInsert of this.databaseBuffer.objectsToInsert) {
      await this.knex(objectToInsert.tableName).insert(objectToInsert.values);
      this.databaseBuffer.objectsToDelete.unshift(objectToInsert);
    }
    this.databaseBuffer.objectsToInsert = [];
  }

  async clean() {
    if (this.databaseBuffer.objectsToDelete.length > 0) {
      for (const objectToDelete of this.databaseBuffer.objectsToDelete) {
        await this.knex(objectToDelete.tableName).where({ id: objectToDelete.values.id }).delete();
      }
      this.databaseBuffer.purge();
    }
  }
};

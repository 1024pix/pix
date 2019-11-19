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
    const trx = await this.knex.transaction();
    for (const objectToInsert of this.databaseBuffer.objectsToInsert) {
      await trx(objectToInsert.tableName).insert(objectToInsert.values);
      this.databaseBuffer.objectsToDelete.unshift(objectToInsert);
    }
    this.databaseBuffer.objectsToInsert = [];
    await trx.commit();
  }

  async clean() {
    if (this.databaseBuffer.objectsToDelete.length > 0) {
      const trx = await this.knex.transaction();
      for (const objectToDelete of this.databaseBuffer.objectsToDelete) {
        await trx(objectToDelete.tableName).where({ id: objectToDelete.values.id }).delete();
      }
      this.databaseBuffer.purge();
      await trx.commit();
    }
  }
};

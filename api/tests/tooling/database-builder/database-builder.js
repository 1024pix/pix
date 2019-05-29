const databaseBuffer = require('./database-buffer');
const factory = require('./factory/index');

module.exports = class DatabaseBuilder {
  constructor({ knex }) {
    this.knex = knex;
    this.databaseBuffer = databaseBuffer;
    this.factory = factory;
  }

  async commit() {
    for (const objectToInsert of this.databaseBuffer.objectsToInsert) {
      await this.knex(objectToInsert.tableName).insert(objectToInsert.values);
      this.databaseBuffer.objectsToDelete.unshift(objectToInsert);
    }
  }

  async clean() {
    for (const objectToDelete of this.databaseBuffer.objectsToDelete) {
      await this.knex(objectToDelete.tableName).where({ id: objectToDelete.values.id }).delete();
    }
    this.databaseBuffer.purge();
  }
};

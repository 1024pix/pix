const databaseBuffer = require('./database-buffer');
const factory = require('./factory/index');

module.exports = class DatabaseBuilder {
  constructor({ knex }) {
    this.knex = knex;
    this.databaseBuffer = databaseBuffer;
    this.factory = factory;
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
    const objectsToDelete = this.databaseBuffer.objectsToInsert.slice().reverse();

    return objectsToDelete.reduce((promise, objectToDelete) => {

      return promise
        .then(() => this.knex(objectToDelete.tableName).where({ id: objectToDelete.values.id }).delete());

    }, initialPromise)
      .then(() => {
        this.databaseBuffer.purge();
      });
  }
};

const databaseBuffer = require('./database-buffer');
const factory = require('./factory');

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

    return this.databaseBuffer.objectsToInsert.reduce((promise, objectToInsert) => {

      return promise
        .then(() => this.knex(objectToInsert.tableName).delete());

    }, initialPromise)
      .then(() => {
        this.databaseBuffer.purge();
      });
  }
};

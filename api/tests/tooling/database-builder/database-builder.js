const databaseBuffer = require('./database-buffer');
const factory = require('./factory/index');
const knexDatabaseConnection = require('../../../db/knex-database-connection');
const _ = require('lodash');

module.exports = class DatabaseBuilder {
  constructor({ knex }) {
    this.knex = knex;
    this.databaseBuffer = databaseBuffer;
    this.tablesOrderedByDependencyWithDirtinessMap = [];
    this.factory = factory;
    this.isFirstCommit = true;
  }

  async commit() {
    if (this.isFirstCommit) {
      await knexDatabaseConnection.emptyAllTables();
      await this._initTablesOrderedByDependencyWithDirtinessMap();
      this.isFirstCommit = false;
    }
    const trx = await this.knex.transaction();
    for (const objectToInsert of this.databaseBuffer.objectsToInsert) {
      await trx(objectToInsert.tableName).insert(objectToInsert.values);
      this._setTableAsDirty(objectToInsert.tableName);
    }
    this.databaseBuffer.objectsToInsert = [];
    this.databaseBuffer.tablesToDelete = this._selectDirtyTables();
    await trx.commit();
  }

  async clean() {
    if (this.databaseBuffer.tablesToDelete.length > 0) {
      const trx = await this.knex.transaction();
      for (const table of this.databaseBuffer.tablesToDelete) {
        await trx(table).delete();
      }
      this.databaseBuffer.purge();
      this._purgeDirtiness();
      await trx.commit();
    }
  }

  async _initTablesOrderedByDependencyWithDirtinessMap() {
    const dependencyOrderedTables = await knexDatabaseConnection.listTablesByDependencyOrderDesc();
    this.tablesOrderedByDependencyWithDirtinessMap = _.map(dependencyOrderedTables, (table) => {
      return {
        table,
        isDirty: false,
      };
    });
  }

  _setTableAsDirty(table) {
    const tableWithDirtiness = _.find(this.tablesOrderedByDependencyWithDirtinessMap, { table });
    tableWithDirtiness.isDirty = true;
  }

  _selectDirtyTables() {
    const dirtyTableObjects = _.filter(this.tablesOrderedByDependencyWithDirtinessMap, { isDirty: true });
    return _.map(dirtyTableObjects, 'table');
  }

  _purgeDirtiness() {
    _.each(this.tablesOrderedByDependencyWithDirtinessMap, (table) => {
      table.isDirty = false;
    });
  }
};

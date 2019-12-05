const airtable = require('../airtable');
const AirtableDatasources = require('../datasources/airtable');
const _ = require('lodash');

module.exports = {

  loadAllTables() {
    return Promise.all(_.map(AirtableDatasources, (datasource) => datasource.preload()));
  },

  load({ tableName, recordId }) {
    return airtable.getRecordSkipCache(tableName, recordId);
  }

};

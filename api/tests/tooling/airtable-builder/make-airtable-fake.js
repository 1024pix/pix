const AirtableRecord = require('airtable').Record;
const _ = require('lodash');

module.exports = function makeAirtableFake(records) {
  return async (tableName, fieldList) => {
    return records.map((record) => new AirtableRecord(tableName, record.id, {
      id: record.id,
      fields: _.pick(record._rawJson.fields, fieldList)
    }));
  };
};

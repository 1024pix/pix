const airtable = require('../../airtable');

const datasourcePrototype = {

  airtableFilter() {
    return true;
  },

  list({ filter } = {}) {
    return airtable.findRecords(this.tableName, this.usedFields)
      .then((airtableRawObjects) => {
        return airtableRawObjects.filter((record) => this.airtableFilter(record) && (filter ? filter(record) : true)).map(this.fromAirTableObject);
      });
  },

};

module.exports = {

  extend(props) {
    return Object.assign(Object.create(datasourcePrototype), props);
  },

};

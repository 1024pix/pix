const _ = require('lodash');
const airtable = require('../../airtable');
const datasource = require('./datasource');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

const tableName = 'Tubes';

const usedFields = [
  'Nom',
  'Titre',
  'Description',
  'Titre pratique',
  'Description pratique',
];

function fromAirTableObject(airtableRecord) {
  return {
    id: airtableRecord.getId(),
    name: airtableRecord.get('Nom'),
    title: airtableRecord.get('Titre'),
    description: airtableRecord.get('Description'),
    practicalTitle: airtableRecord.get('Titre pratique'),
    practicalDescription: airtableRecord.get('Description pratique'),
  };
}

module.exports = datasource.extend({

  tableName,

  usedFields,

  fromAirTableObject,

  findByNames(tubeNames) {
    return this.list({ filter: (rawTube) => _.includes(tubeNames, rawTube.fields['Nom']) });
  },

  get(id) {
    return airtable.getRecord(tableName, id)
      .then(fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }
        throw err;
      });
  },
});

const _ = require('lodash');
const datasource = require('./datasource');

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

});

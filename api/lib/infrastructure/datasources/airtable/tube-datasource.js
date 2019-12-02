const _ = require('lodash');
const datasource = require('./datasource');

module.exports = datasource.extend({

  tableName: 'Tubes',

  usedFields: [
    'Nom',
    'Titre',
    'Description',
    'Titre pratique',
    'Description pratique',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.getId(),
      name: airtableRecord.get('Nom'),
      title: airtableRecord.get('Titre'),
      description: airtableRecord.get('Description'),
      practicalTitle: airtableRecord.get('Titre pratique'),
      practicalDescription: airtableRecord.get('Description pratique'),
    };
  },

  findByNames(tubeNames) {
    return this.list({ filter: (rawTube) => _.includes(tubeNames, rawTube.fields['Nom']) });
  },

});

const _ = require('lodash');
const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Demo',

  tableName: 'Tests',

  usedFields: [
    'id persistant',
    'Nom',
    'Description',
    'Adaptatif ?',
    'Competence (id persistant)',
    'Épreuves (id persistant)',
    'Image',
  ],

  fromAirTableObject(airtableRecord) {
    let imageUrl;
    if (airtableRecord.get('Image')) {
      imageUrl = airtableRecord.get('Image')[0].url;
    }

    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      description: airtableRecord.get('Description'),
      adaptive: airtableRecord.get('Adaptatif ?'),
      competences: airtableRecord.get('Competence (id persistant)'),
      challenges: _.reverse(airtableRecord.get('Épreuves (id persistant)')),
      imageUrl,
    };
  },

});

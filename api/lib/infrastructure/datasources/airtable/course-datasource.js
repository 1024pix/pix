const _ = require('lodash');
const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Course',

  tableName: 'Tests',

  usedFields: [
    'id',
    'Nom',
    'Description',
    'Adaptatif ?',
    'Competence',
    'Épreuves',
    'Image',
  ],

  fromAirTableObject(airtableRecord) {
    let imageUrl;
    if (airtableRecord.get('Image')) {
      imageUrl = airtableRecord.get('Image')[0].url;
    }

    return {
      id: airtableRecord.get('id'),
      name: airtableRecord.get('Nom'),
      description: airtableRecord.get('Description'),
      adaptive: airtableRecord.get('Adaptatif ?'),
      competences: airtableRecord.get('Competence'),
      challenges: _.reverse(airtableRecord.get('Épreuves')),
      imageUrl,
    };
  },

});

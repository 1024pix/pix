const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'id',
    'Titre',
    'Sous-domaine',
    'Description',
    'Domaine',
    'Acquis (via Tubes)',
    'Origine',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id'),
      name: airtableRecord.get('Titre'),
      index: airtableRecord.get('Sous-domaine'),
      description: airtableRecord.get('Description'),
      areaId: airtableRecord.get('Domaine') ? airtableRecord.get('Domaine')[0] : '',
      skillIds: airtableRecord.get('Acquis (via Tubes)') || [],
      origin: airtableRecord.get('Origine'),
    };
  },

});


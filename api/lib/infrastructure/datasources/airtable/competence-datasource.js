const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'Titre',
    'Sous-domaine',
    'Description',
    'Domaine',
    'Tests',
    'Acquis (via Tubes)',
    'Origine',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.getId(),
      name: airtableRecord.get('Titre'),
      index: airtableRecord.get('Sous-domaine'),
      description: airtableRecord.get('Description'),
      areaId: airtableRecord.get('Domaine') ? airtableRecord.get('Domaine')[0] : '',
      courseId: airtableRecord.get('Tests') ? airtableRecord.get('Tests')[0] : '',
      skillIds: airtableRecord.get('Acquis (via Tubes)') || [],
      origin: airtableRecord.get('Origine') || 'Pix',
    };
  },

});


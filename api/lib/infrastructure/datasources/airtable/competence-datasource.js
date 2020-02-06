const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'id persistant',
    'Titre',
    'Sous-domaine',
    'Description',
    'Domaine (id persistant)',
    'Acquis (via Tubes) (id persistant)',
    'Origine',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Titre'),
      index: airtableRecord.get('Sous-domaine'),
      description: airtableRecord.get('Description'),
      areaId: airtableRecord.get('Domaine (id persistant)') ? airtableRecord.get('Domaine (id persistant)')[0] : '',
      skillIds: airtableRecord.get('Acquis (via Tubes) (id persistant)') || [],
      origin: airtableRecord.get('Origine'),
    };
  },

});


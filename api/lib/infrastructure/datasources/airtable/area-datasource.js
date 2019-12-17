const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Area',

  tableName: 'Domaines',

  usedFields: [
    'Code',
    'Nom',
    'Titre',
    'Competences (identifiants)',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.getId(),
      code: airtableRecord.get('Code'),
      name: airtableRecord.get('Nom'),
      title: airtableRecord.get('Titre'),
      competenceIds: airtableRecord.get('Competences (identifiants)'),
    };
  },

});


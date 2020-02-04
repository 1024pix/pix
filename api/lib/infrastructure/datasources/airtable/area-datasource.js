const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Area',

  tableName: 'Domaines',

  usedFields: [
    'id',
    'Code',
    'Nom',
    'Titre',
    'Competences (identifiants)',
    'Couleur',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id'),
      code: airtableRecord.get('Code'),
      name: airtableRecord.get('Nom'),
      title: airtableRecord.get('Titre'),
      competenceIds: airtableRecord.get('Competences (identifiants)'),
      color: airtableRecord.get('Couleur'),
    };
  },

});


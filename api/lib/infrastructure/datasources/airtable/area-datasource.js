const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Area',

  tableName: 'Domaines',

  usedFields: [
    'id persistant',
    'Code',
    'Nom',
    'Titre',
    'Competences (identifiants) (id persistant)',
    'Couleur',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      code: airtableRecord.get('Code'),
      name: airtableRecord.get('Nom'),
      title: airtableRecord.get('Titre'),
      competenceIds: airtableRecord.get('Competences (identifiants) (id persistant)'),
      color: airtableRecord.get('Couleur'),
    };
  },

});


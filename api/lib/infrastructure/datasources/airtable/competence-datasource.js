const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'id persistant',
    'Titre',
    'Titre fr-fr',
    'Titre en-us',
    'Sous-domaine',
    'Description',
    'Description fr-fr',
    'Description en-us',
    'Domaine (id persistant)',
    'Acquis (via Tubes) (id persistant)',
    'Origine',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Titre'),
      nameFrFr: airtableRecord.get('Titre fr-fr') || airtableRecord.get('Titre'),
      nameEnUs: airtableRecord.get('Titre en-us') || airtableRecord.get('Titre'),
      index: airtableRecord.get('Sous-domaine'),
      description: airtableRecord.get('Description'),
      descriptionFrFr: airtableRecord.get('Description fr-fr') || airtableRecord.get('Description'),
      descriptionEnUs: airtableRecord.get('Description en-us') || airtableRecord.get('Description'),
      areaId: airtableRecord.get('Domaine (id persistant)') ? airtableRecord.get('Domaine (id persistant)')[0] : '',
      skillIds: airtableRecord.get('Acquis (via Tubes) (id persistant)') || [],
      origin: airtableRecord.get('Origine'),
    };
  },

});


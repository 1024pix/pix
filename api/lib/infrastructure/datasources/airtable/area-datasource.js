const datasource = require('./datasource');

module.exports = datasource.extend({

  tableName: 'Domaines',

  usedFields: [
    'Code',
    'Nom',
    'Titre',
    'Competences (identifiants)',
  ],

  fromAirTableObject(airtableDomaineObject) {
    return {
      id: airtableDomaineObject.getId(),
      code: airtableDomaineObject.get('Code'),
      name: airtableDomaineObject.get('Nom'),
      title: airtableDomaineObject.get('Titre'),
      competenceIds: airtableDomaineObject.get('Competences (identifiants)'),
    };
  },

});


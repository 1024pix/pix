const datasource = require('./datasource');

module.exports = datasource.extend({

  tableName: 'Competences',

  usedFields: [
    'Titre',
    'Sous-domaine',
    'Description',
    'Domaine',
    'Tests',
    'Acquis (via Tubes)'
  ],

  fromAirTableObject(rawAirtableCompetence) {
    return {
      id: rawAirtableCompetence.getId(),
      name: rawAirtableCompetence.get('Titre'),
      index: rawAirtableCompetence.get('Sous-domaine'),
      description: rawAirtableCompetence.get('Description'),
      areaId: rawAirtableCompetence.get('Domaine') ? rawAirtableCompetence.get('Domaine')[0] : '',
      courseId: rawAirtableCompetence.get('Tests') ? rawAirtableCompetence.get('Tests')[0] : '',
      skillIds: rawAirtableCompetence.get('Acquis (via Tubes)') || [],
    };
  },

});


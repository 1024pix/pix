const airtable = require('../../airtable');
const datasource = require('./datasource');

const tableName = 'Competences';

const usedFields = [
  'Titre',
  'Sous-domaine',
  'Description',
  'Domaine',
  'Tests',
  'Acquis (via Tubes)'
];

function fromAirTableObject(rawAirtableCompetence) {
  return {
    id: rawAirtableCompetence.getId(),
    name: rawAirtableCompetence.get('Titre'),
    index: rawAirtableCompetence.get('Sous-domaine'),
    description: rawAirtableCompetence.get('Description'),
    areaId: rawAirtableCompetence.get('Domaine') ? rawAirtableCompetence.get('Domaine')[0] : '',
    courseId: rawAirtableCompetence.get('Tests') ? rawAirtableCompetence.get('Tests')[0] : '',
    skillIds: rawAirtableCompetence.get('Acquis (via Tubes)') || [],
  };
}

module.exports = datasource.extend({

  tableName,

  usedFields,

  fromAirTableObject,

  get(id) {
    return airtable.getRecord(tableName, id)
      .then(fromAirTableObject);
  }
});


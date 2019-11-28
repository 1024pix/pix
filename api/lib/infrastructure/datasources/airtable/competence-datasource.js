const airtable = require('../../airtable');
const { Competence } = require('./objects');

const TABLE_NAME = 'Competences';

const USED_FIELDS = [
  'Titre',
  'Sous-domaine',
  'Description',
  'Domaine',
  'Tests',
  'Acquis (via Tubes)'
];

function fromAirTableObject(rawAirtableCompetence) {
  return new Competence({
    id: rawAirtableCompetence.getId(),
    name: rawAirtableCompetence.get('Titre'),
    index: rawAirtableCompetence.get('Sous-domaine'),
    description: rawAirtableCompetence.get('Description'),
    areaId: rawAirtableCompetence.get('Domaine') ? rawAirtableCompetence.get('Domaine')[0] : '',
    courseId: rawAirtableCompetence.get('Tests') ? rawAirtableCompetence.get('Tests')[0] : '',
    skillIds: rawAirtableCompetence.get('Acquis (via Tubes)'),
  });
}

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  fromAirTableObject,

  list() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
      .then((airtableRawObjects) => airtableRawObjects.map(fromAirTableObject));
  },

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(fromAirTableObject);
  }
};


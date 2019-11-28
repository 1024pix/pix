const airtable = require('../../airtable');
const { Area } = require('./objects');

const TABLE_NAME = 'Domaines';

const USED_FIELDS = [
  'Code',
  'Nom',
  'Titre',
  'Competences (identifiants)',
];

function fromAirTableObject(airtableDomaineObject) {
  return new Area({
    id: airtableDomaineObject.getId(),
    code: airtableDomaineObject.get('Code'),
    name: airtableDomaineObject.get('Nom'),
    title: airtableDomaineObject.get('Titre'),
    competenceIds: airtableDomaineObject.get('Competences (identifiants)'),
  });
}

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  fromAirTableObject,

  list() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
      .then((airtableRawObjects) => {
        return airtableRawObjects.map(fromAirTableObject);
      });
  },
};


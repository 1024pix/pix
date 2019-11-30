const airtable = require('../../airtable');

const tableName = 'Domaines';

const usedFields = [
  'Code',
  'Nom',
  'Titre',
  'Competences (identifiants)',
];

function fromAirTableObject(airtableDomaineObject) {
  return {
    id: airtableDomaineObject.getId(),
    code: airtableDomaineObject.get('Code'),
    name: airtableDomaineObject.get('Nom'),
    title: airtableDomaineObject.get('Titre'),
    competenceIds: airtableDomaineObject.get('Competences (identifiants)'),
  };
}

module.exports = {

  tableName,

  usedFields,

  fromAirTableObject,

  list() {
    return airtable.findRecords(tableName, usedFields)
      .then((airtableRawObjects) => {
        return airtableRawObjects.map(fromAirTableObject);
      });
  },
};


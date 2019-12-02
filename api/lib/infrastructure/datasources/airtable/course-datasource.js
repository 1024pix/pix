const _ = require('lodash');
const airtable = require('../../airtable');

const tableName = 'Tests';

const usedFields = [
  'Nom',
  'Description',
  'Adaptatif ?',
  'Competence',
  'Épreuves',
  'Image',
];

function fromAirTableObject(airtableRecord) {
  let imageUrl;
  if (airtableRecord.get('Image')) {
    imageUrl = airtableRecord.get('Image')[0].url;
  }

  return {
    id: airtableRecord.getId(),
    name: airtableRecord.get('Nom'),
    description: airtableRecord.get('Description'),
    adaptive: airtableRecord.get('Adaptatif ?'),
    competences: airtableRecord.get('Competence'),
    challenges: airtableRecord.get('Épreuves'),
    imageUrl,
  };
}

module.exports = {

  tableName,

  usedFields,

  fromAirTableObject,

  getAdaptiveCourses() {
    return airtable.findRecords(tableName, usedFields)
      .then((airtableRawObjects) => {
        return _.filter(airtableRawObjects, {
          fields: {
            'Adaptatif ?': true,
            'Statut': 'Publié',
          }
        }).map(fromAirTableObject);
      });
  },

  get(id) {
    return airtable.getRecord(tableName, id)
      .then(fromAirTableObject);
  }
};

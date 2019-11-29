const _ = require('lodash');
const airtable = require('../../airtable');

const TABLE_NAME = 'Tests';

const USED_FIELDS = [
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

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  fromAirTableObject,

  getAdaptiveCourses() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
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
    return airtable.getRecord(TABLE_NAME, id)
      .then(fromAirTableObject);
  }
};

const airtable = require('../../airtable');
const datasource = require('./datasource');

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

module.exports = datasource.extend({

  tableName,

  usedFields,

  fromAirTableObject,

  getAdaptiveCourses() {
    return this.list({ filter: (rawCourse) => rawCourse.get('Adaptatif ?') && rawCourse.get('Statut') === 'Publié' });
  },

  get(id) {
    return airtable.getRecord(tableName, id)
      .then(fromAirTableObject);
  }
});

const datasource = require('./datasource');

module.exports = datasource.extend({

  tableName: 'Tests',

  usedFields: [
    'Nom',
    'Description',
    'Adaptatif ?',
    'Competence',
    'Épreuves',
    'Image',
  ],

  fromAirTableObject(airtableRecord) {
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
  },

  getAdaptiveCourses() {
    return this.list({ filter: (rawCourse) => rawCourse.get('Adaptatif ?') && rawCourse.get('Statut') === 'Publié' });
  },

});

const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Course',

  tableName: 'Tests',

  usedFields: [
    'id persistant',
    'Nom',
    'Description',
    'Adaptatif ?',
    'Competence (id persistant)',
    'Épreuves (id persistant)',
    'Image',
  ],

  fromAirTableObject(airtableRecord) {
    let imageUrl;
    if (airtableRecord.get('Image')) {
      imageUrl = airtableRecord.get('Image')[0].url;
    }

    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      description: airtableRecord.get('Description'),
      adaptive: airtableRecord.get('Adaptatif ?'),
      competences: airtableRecord.get('Competence (id persistant)'),
      challenges: airtableRecord.get('Épreuves (id persistant)'),
      status: airtableRecord.get('Statut'),
      imageUrl,
    };
  },

  async findAdaptiveCourses() {
    const courses = await this.list();
    return courses.filter((courseData) =>
      courseData.adaptive &&
      courseData.status === 'Publié');
  },

});

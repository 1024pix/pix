const _ = require('../../utils/lodash-utils');
const Course = require('../../../domain/models/referential/course');
const AirtableSerializer = require('./airtable-serializer');

class CourseSerializer extends AirtableSerializer {

  deserialize(airtableRecord) {
    const course = new Course();

    course.id = airtableRecord.id;

    if (airtableRecord.fields) {

      const fields = airtableRecord.fields;

      course.name = fields['Nom'];
      course.description = fields['Description'];
      course.duration = fields['Durée'];
      course.isAdaptive = fields['Adaptatif ?'];
      course.type = fields['Adaptatif ?'] ? 'PLACEMENT' : 'DEMO';
      course.competences = fields['Competence'] || [];

      if (fields['Image'] && fields['Image'].length > 0) {
        course.imageUrl = fields['Image'][0].url;
      }

      // See https://github.com/Airtable/airtable.js/issues/17
      const debuggedFieldsEpreuves = fields['Épreuves'];
      if (_.isArray(debuggedFieldsEpreuves)) {
        _.reverse(debuggedFieldsEpreuves);
      }
      course.challenges = debuggedFieldsEpreuves;
    }

    return course;
  }
}
module.exports = new CourseSerializer();

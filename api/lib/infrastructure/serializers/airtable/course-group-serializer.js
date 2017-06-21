const AirtableSerializer = require('./airtable-serializer');
const CourseGroup = require('../../../domain/models/referential/course-group');

class courseGroupSerializer extends AirtableSerializer {

  constructor() {
    super('course-group');
  }

  deserialize(airtableRecord) {
    const courseGroup = new CourseGroup();

    courseGroup.id = airtableRecord.id;

    if (airtableRecord.fields) {
      courseGroup.name = airtableRecord.fields['nom'];
      courseGroup.courses = airtableRecord.fields['tests'];
    }

    return courseGroup;
  }

}

module.exports = new courseGroupSerializer();

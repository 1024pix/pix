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
      courseGroup.name = airtableRecord.fields['Nom'];
      const arrayOfTestId = airtableRecord.fields['Tests'] || [];

      courseGroup.courses = [];
      arrayOfTestId.forEach((TestId) => {
        courseGroup.courses.push({ id: TestId  });
      });
    }

    return courseGroup;
  }

}

module.exports = new courseGroupSerializer();

const _ = require('../../utils/lodash-utils');
const Course = require('../../../domain/models/Course');

class CourseSerializer {

  deserialize(airtableRecord) {

    let imageUrl;
    if (airtableRecord.get('Image')) {
      imageUrl =  airtableRecord.get('Image')[0].url;
    }

    const challenges = airtableRecord.get('Épreuves');
    if (_.isArray(challenges)) {
      _.reverse(challenges);
    }

    return new Course({
      id: airtableRecord.getId(),
      name: airtableRecord.get('Nom'),
      description: airtableRecord.get('Description'),
      type: airtableRecord.get('Adaptatif ?') ? 'PLACEMENT' : 'DEMO',
      competences: airtableRecord.get('Competence'),
      imageUrl,
      challenges
    });
  }
}

module.exports = new CourseSerializer();

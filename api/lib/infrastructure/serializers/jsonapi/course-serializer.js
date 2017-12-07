const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = {

  serialize(courses) {
    return new JSONAPISerializer('course', {
      attributes: ['name', 'description', 'duration', 'isAdaptive', 'nbChallenges', 'imageUrl'],
      transform(record) {
        const course = Object.assign({}, record);
        if (record.challenges) {
          course.nbChallenges = record.challenges.length;
        }
        return course;
      }
    }).serialize(courses);
  }

};

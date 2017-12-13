const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(courses) {
    return new Serializer('course', {
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

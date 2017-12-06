const JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = {
  serialize(course) {
    return new JSONAPISerializer('course', {
      attributes: ['name', 'description', 'duration', 'isAdaptive', 'nbChallenges', 'imageUrl'],
      transform(course) {
        course.id = course.id.toString();
        course.nbChallenges = course.challenges.length;
        return course;
      }
    }).serialize(course);
  }
};

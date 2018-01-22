const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(courses) {
    return new Serializer('course', {
      attributes: ['name', 'description', 'duration', 'isAdaptive', 'nbChallenges', 'type', 'imageUrl', 'assessment'],
      assessment: {
        ref: 'id',
      }
    }).serialize(courses);
  }

};

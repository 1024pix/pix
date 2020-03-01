const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(courses) {
    return new Serializer('course', {
      attributes: ['name', 'description', 'nbChallenges', 'type', 'imageUrl'],
    }).serialize(courses);
  }

};

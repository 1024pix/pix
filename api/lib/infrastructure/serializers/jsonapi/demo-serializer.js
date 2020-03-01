const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(demos) {
    return new Serializer('course', {
      attributes: ['name', 'description', 'nbChallenges', 'type', 'imageUrl'],
    }).serialize(demos);
  }

};

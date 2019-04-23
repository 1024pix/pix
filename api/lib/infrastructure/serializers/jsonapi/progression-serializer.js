const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(progression) {
    return new Serializer('progression', {
      attributes: ['completionRate'],
    }).serialize(progression);
  }
};

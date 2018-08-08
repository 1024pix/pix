const { Serializer } = require('jsonapi-serializer');


module.exports = {
  serialize(targetProfile) {
    return new Serializer('target-profiles', {
      attributes: ['name'],
    }).serialize(targetProfile);
  }
}

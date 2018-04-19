const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(correction) {
    return new Serializer('corrections', {
      attributes: ['solution']
    }).serialize(correction);
  }

};

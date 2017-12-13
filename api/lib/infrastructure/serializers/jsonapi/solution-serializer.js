const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(solutions) {
    return new Serializer('solutions', {
      attributes: ['value']
    }).serialize(solutions);
  }

};

const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(skills) {
    return new Serializer('skill', {
      ref: 'id',
    }).serialize(skills);
  },
};

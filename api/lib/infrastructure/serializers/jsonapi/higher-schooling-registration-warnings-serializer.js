const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizations, meta) {
    return new Serializer('higher-schooling-registration-warnings', {
      attributes: ['warnings'],
      meta,
    }).serialize(organizations);
  },

};

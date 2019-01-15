const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizations, meta) {
    return new Serializer('organizations', {
      attributes: ['name', 'type', 'code', 'logoUrl', 'user'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName', 'email'],
      },
      meta
    }).serialize(organizations);
  },

};

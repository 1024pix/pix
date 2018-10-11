const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizations) {
    return new Serializer('organizations', {
      attributes: ['name', 'type', 'code', 'user'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName', 'email'],
        included: true,
      }
    }).serialize(organizations);
  },

};

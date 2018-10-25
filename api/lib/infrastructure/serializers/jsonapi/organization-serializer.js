const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizations) {
    return new Serializer('organizations', {
      attributes: ['name', 'type', 'code', 'user', 'members'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName', 'email'],
      },
      members: {
        ref: 'id',
        attributes: ['firstName', 'lastName', 'email'],
      },
      typeForAttribute(type) {
        if (type === 'members') return 'users';
        return undefined;
      },
    }).serialize(organizations);
  },

};

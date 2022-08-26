const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(membership, meta) {
    return new Serializer('memberships', {
      attributes: ['organizationRole', 'user'],
      user: {
        ref: 'id',
        included: true,
        attributes: ['firstName', 'lastName', 'email'],
      },
      meta,
    }).serialize(membership);
  },
};

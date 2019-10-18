const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(invitations) {
    return new Serializer('organization-invitations', {
      attributes: ['organizationId', 'email', 'status', 'createdAt'],
    }).serialize(invitations);
  },

};

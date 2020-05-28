const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(invitations) {
    return new Serializer('organization-invitations', {
      attributes: ['organizationId', 'organizationName', 'email', 'status', 'createdAt', 'updatedAt'],
    }).serialize(invitations);
  },

};

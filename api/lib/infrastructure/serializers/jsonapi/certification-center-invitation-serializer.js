const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serializeForAdmin(invitations) {
    return new Serializer('certification-center-invitations', {
      attributes: ['certificationCenterId', 'email', 'updatedAt'],
    }).serialize(invitations);
  },
};

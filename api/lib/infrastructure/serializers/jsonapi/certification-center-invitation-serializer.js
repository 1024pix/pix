const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(invitations) {
    return new Serializer('certification-center-invitations', {
      attributes: ['certificationCenterId', 'certificationCenterName', 'status'],
    }).serialize(invitations);
  },

  serializeForAdmin(invitations) {
    return new Serializer('certification-center-invitations', {
      attributes: ['certificationCenterId', 'email', 'updatedAt'],
    }).serialize(invitations);
  },
};

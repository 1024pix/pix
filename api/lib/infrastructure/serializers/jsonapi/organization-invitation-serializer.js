const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {
  serialize(invitations) {
    return new Serializer('organization-invitations', {
      attributes: ['organizationId', 'organizationName', 'email', 'status', 'updatedAt', 'role'],
    }).serialize(invitations);
  },

  deserializeForCreateOrganizationInvitationAndSendEmail(payload) {
    return new Deserializer().deserialize(payload).then((record) => {
      return {
        role: record.role,
        lang: record.lang,
        email: record.email.toLowerCase(),
      };
    });
  },
};

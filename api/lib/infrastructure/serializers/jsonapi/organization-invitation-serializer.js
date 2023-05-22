import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

const serialize = function (invitations) {
  return new Serializer('organization-invitations', {
    attributes: ['organizationId', 'organizationName', 'email', 'status', 'updatedAt', 'role'],
  }).serialize(invitations);
};

const deserializeForCreateOrganizationInvitationAndSendEmail = function (payload) {
  return new Deserializer().deserialize(payload).then((record) => {
    return {
      role: record.role,
      lang: record.lang,
      email: record.email?.trim().toLowerCase(),
    };
  });
};

export { serialize, deserializeForCreateOrganizationInvitationAndSendEmail };

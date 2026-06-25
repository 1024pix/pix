import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

const serialize = function (invitations) {
  return new Serializer('certification-center-invitations', {
    attributes: ['certificationCenterId', 'certificationCenterName', 'status'],
  }).serialize(invitations);
};

const serializeForAdmin = function (invitations) {
  return new Serializer('certification-center-invitations', {
    attributes: ['email', 'updatedAt', 'role', 'locale'],
  }).serialize(invitations);
};

const deserializeForAdmin = function (payload) {
  return new Deserializer().deserialize(payload).then((record) => {
    return {
      email: record.email,
      locale: record.locale,
      role: record.role,
    };
  });
};

export const certificationCenterInvitationSerializer = { deserializeForAdmin, serialize, serializeForAdmin };

import { Serializer, Deserializer } from 'jsonapi-serializer';

const serialize = function (invitations) {
  return new Serializer('certification-center-invitations', {
    attributes: ['certificationCenterId', 'certificationCenterName', 'status'],
  }).serialize(invitations);
};

const serializeForAdmin = function (invitations) {
  return new Serializer('certification-center-invitations', {
    attributes: ['email', 'updatedAt'],
  }).serialize(invitations);
};

const deserializeForAdmin = function (payload) {
  return new Deserializer().deserialize(payload).then((record) => {
    return {
      email: record.email,
      language: record.language,
    };
  });
};

export { serialize, serializeForAdmin, deserializeForAdmin };

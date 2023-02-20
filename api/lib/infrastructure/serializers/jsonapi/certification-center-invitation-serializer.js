import { Serializer, Deserializer } from 'jsonapi-serializer';

export default {
  serialize(invitations) {
    return new Serializer('certification-center-invitations', {
      attributes: ['certificationCenterId', 'certificationCenterName', 'status'],
    }).serialize(invitations);
  },

  serializeForAdmin(invitations) {
    return new Serializer('certification-center-invitations', {
      attributes: ['email', 'updatedAt'],
    }).serialize(invitations);
  },

  deserializeForAdmin(payload) {
    return new Deserializer().deserialize(payload).then((record) => {
      return {
        email: record.email,
        language: record.language,
      };
    });
  },
};

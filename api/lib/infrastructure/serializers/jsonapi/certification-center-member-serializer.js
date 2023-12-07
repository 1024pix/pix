import jsonapiSerializer from 'jsonapi-serializer';
import { CertificationCenterMember } from '../../../domain/models/CertificationCenterMember.js';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCenterMemberships) {
  return new Serializer('certification-center-members', {
    transform: function (record) {
      const { firstName, lastName } = record.user;
      return {
        id: record.id,
        firstName,
        lastName,
        isReferer: record.isReferer,
        role: record.role,
        userId: record.user.id,
      };
    },
    ref: 'id',
    attributes: ['firstName', 'lastName', 'isReferer', 'role', 'userId'],
  }).serialize(certificationCenterMemberships);
};

const deserialize = function (payload) {
  return new CertificationCenterMember({
    id: payload.data?.id,
    role: payload.data?.attributes?.role,
  });
};

export { deserialize, serialize };

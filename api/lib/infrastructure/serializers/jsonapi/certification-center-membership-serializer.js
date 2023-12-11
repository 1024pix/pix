import jsonapiSerializer from 'jsonapi-serializer';
import { CertificationCenterMembership } from '../../../domain/models/index.js';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCenterMemberships) {
  return new Serializer('certificationCenterMemberships', {
    transform: function (record) {
      record.certificationCenter.sessions = [];
      return record;
    },
    attributes: ['createdAt', 'certificationCenter', 'user', 'role'],
    certificationCenter: {
      ref: 'id',
      included: true,
      attributes: ['name', 'type', 'sessions'],
      sessions: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/certification-centers/${parent.id}/sessions`;
          },
        },
      },
    },
    user: {
      ref: 'id',
      included: true,
      attributes: ['firstName', 'lastName', 'email'],
    },
  }).serialize(certificationCenterMemberships);
};

const serializeMembers = function (certificationCenterMemberships) {
  return new Serializer('members', {
    transform: function (record) {
      const { id, firstName, lastName } = record.user;
      return {
        id,
        firstName,
        lastName,
        isReferer: record.isReferer,
        role: record.role,
        certificationCenterMembershipId: record.id,
      };
    },
    ref: 'id',
    attributes: ['firstName', 'lastName', 'isReferer', 'role', 'certificationCenterMembershipId'],
  }).serialize(certificationCenterMemberships);
};

const serializeForAdmin = function (certificationCenterMemberships) {
  return new Serializer('certification-center-memberships', {
    attributes: ['role', 'createdAt', 'updatedAt', 'certificationCenter', 'user'],
    certificationCenter: {
      ref: 'id',
      included: true,
      attributes: ['name', 'type', 'externalId'],
    },
    user: {
      ref: 'id',
      included: true,
      attributes: ['firstName', 'lastName', 'email'],
    },
  }).serialize(certificationCenterMemberships);
};

const deserialize = function (payload) {
  return new CertificationCenterMembership({
    id: payload.data?.id,
    role: payload.data?.attributes?.role,
  });
};

export { deserialize, serialize, serializeMembers, serializeForAdmin };

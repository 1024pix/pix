import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { Membership } from '../../../../../lib/domain/models/Membership.js';

const serialize = function (membership, meta) {
  return new Serializer('memberships', {
    transform(record) {
      if (!record.user) {
        delete record.user;
      }

      if (!record.organization) {
        delete record.organization;
      }
      return record;
    },
    attributes: ['organization', 'organizationRole', 'user'],
    organization: {
      ref: 'id',
      included: true,
      attributes: [
        'code',
        'name',
        'type',
        'isManagingStudents',
        'externalId',
        'campaigns',
        'targetProfiles',
        'memberships',
        'organizationInvitations',
      ],
      campaigns: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/campaigns`;
          },
        },
      },
      targetProfiles: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/target-profiles`;
          },
        },
      },
      memberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/memberships`;
          },
        },
      },
      organizationInvitations: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/invitations`;
          },
        },
      },
    },
    user: {
      ref: 'id',
      included: true,
      attributes: ['firstName', 'lastName', 'email'],
    },
    meta,
  }).serialize(membership);
};

const serializeForAdmin = function (membership, meta) {
  return new Serializer('organization-memberships', {
    transform(record) {
      if (!record.user) {
        delete record.user;
      }

      if (!record.organization) {
        delete record.organization;
      }
      return record;
    },
    attributes: ['organization', 'organizationRole', 'user'],
    organization: {
      ref: 'id',
      included: true,
      attributes: [
        'code',
        'name',
        'type',
        'isManagingStudents',
        'externalId',
        'campaigns',
        'targetProfiles',
        'organizationMemberships',
        'students',
        'organizationInvitations',
      ],
      campaigns: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/campaigns`;
          },
        },
      },
      targetProfiles: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/target-profiles`;
          },
        },
      },
      organizationMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/memberships`;
          },
        },
      },
      students: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/students`;
          },
        },
      },
      organizationInvitations: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/organizations/${parent.id}/invitations`;
          },
        },
      },
    },
    user: {
      ref: 'id',
      included: true,
      attributes: ['firstName', 'lastName', 'email'],
    },
    meta,
  }).serialize(membership);
};

const deserialize = function (json) {
  return new Membership({
    id: json.data.id,
    organizationRole: json.data.attributes['organization-role'],
  });
};

export { deserialize, serialize, serializeForAdmin };

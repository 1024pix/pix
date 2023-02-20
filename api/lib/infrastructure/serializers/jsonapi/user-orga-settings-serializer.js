import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(userOrgaSettings) {
    return new Serializer('user-orga-settings', {
      transform(record) {
        if (!record.user) {
          delete record.user;
        }

        record.organization = record.currentOrganization;
        return record;
      },
      attributes: ['organization', 'user'],
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
    }).serialize(userOrgaSettings);
  },
};

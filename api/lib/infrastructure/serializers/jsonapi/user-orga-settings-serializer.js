const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(userOrgaSettings) {
    return new Serializer('user-orga-settings', {
      transform(record) {
        if (!record.user) {
          delete record.user;
        }

        record.organization = record.currentOrganization;

        // we add a 'campaigns' attr to the organization so that the serializer
        // can see there is a 'campaigns' attribute and add the relationship link.
        if (record.organization) {
          record.organization.campaigns = [];
          record.organization.targetProfiles = [];
          record.organization.memberships = [];
          record.organization.students = [];
          record.organization.organizationInvitations = [];
        }
        return record;
      },
      attributes: ['organization', 'user'],
      organization: {
        ref: 'id',
        included: true,
        attributes: ['code', 'name', 'type', 'isManagingStudents', 'canCollectProfiles', 'externalId', 'campaigns', 'targetProfiles', 'memberships', 'students', 'organizationInvitations'],
        campaigns: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/api/organizations/${parent.id}/campaigns`;
            }
          }
        },
        targetProfiles: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/api/organizations/${parent.id}/target-profiles`;
            }
          }
        },
        memberships: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/api/organizations/${parent.id}/memberships`;
            }
          }
        },
        students: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/api/organizations/${parent.id}/students`;
            }
          }
        },
        organizationInvitations: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/api/organizations/${parent.id}/invitations`;
            }
          }
        },
      },
      user: {
        ref: 'id',
        included: true,
        attributes: ['firstName', 'lastName', 'email']
      }
    }).serialize(userOrgaSettings);
  }
};

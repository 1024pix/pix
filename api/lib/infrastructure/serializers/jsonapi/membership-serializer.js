const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(membership) {
    return new Serializer('memberships', {
      transform(record) {
        // we add a 'campaigns' attr to the organization so that the serializer
        // can see there is a 'campaigns' attribute and add the relationship link.
        if (record.organization) {
          record.organization.campaigns = [];
          record.organization.targetProfiles = [];
        }
        return record;
      },
      attributes: ['organization', 'organizationRole', 'user'],
      organization: {
        ref: 'id',
        included: true,
        attributes: ['code', 'name', 'type', 'campaigns', 'targetProfiles'],
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
        }
      },
      user: {
        ref: 'id',
        included: true,
        attributes: ['firstName', 'lastName', 'email']
      }
    }).serialize(membership);
  }
};

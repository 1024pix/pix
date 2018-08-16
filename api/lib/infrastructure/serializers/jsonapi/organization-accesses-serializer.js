const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizationAccesses) {
    return new Serializer('organization-accesses', {
      transform: function(record) {
        // we add a 'campaigns' attr to the organization so that the serializer
        // can see there is a 'campaigns' attribute and add the relationship link.
        record.organization.campaigns = [];
        record.organization.targetProfiles = [];
        return record;
      },
      attributes: ['organization'],
      organization: {
        ref: 'id',
        included: true,
        attributes: ['code', 'name', 'type', 'campaigns', 'targetProfiles'],
        campaigns: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/organizations/${parent.id}/campaigns`;
            }
          }
        },
        targetProfiles: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/organizations/${parent.id}/target-profiles`;
            }
          }
        }
      }
    }).serialize(organizationAccesses);
  }
};


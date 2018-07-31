const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizationAccesses) {
    return new Serializer('organization-accesses', {
      attributes: ['organization'],
      organization: {
        ref: 'id',
        included: true,
        attributes: ['code', 'name', 'type', 'campaigns'],
        campaigns: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related: function(record, current, parent) {
              return `/organizations/${parent.id}/campaigns`;
            }
          }
        }
      }
    }).serialize(organizationAccesses);
  }
};


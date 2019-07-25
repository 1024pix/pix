const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizations, meta) {
    return new Serializer('organizations', {
      attributes: ['name', 'type', 'code', 'logoUrl', 'externalId', 'user', 'memberships'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName', 'email'],
      },
      memberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/organizations/${parent.id}/memberships`;
          }
        }
      },
      meta
    }).serialize(organizations);
  },

};

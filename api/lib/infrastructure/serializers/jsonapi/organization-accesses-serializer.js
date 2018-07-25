const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizationAccesses) {
    return new Serializer('organization-accesses', {
      attributes: ['organization'],
      organization: {
        ref: 'id',
        attributes: ['code', 'name', 'type'],
        included: true,
      }
    }).serialize(organizationAccesses);
  }
};


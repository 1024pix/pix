const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organization) {
    return new Serializer('organization-membership', {
      attributes: [
        'id',
        'updatedAt',
        'role',
        'organizationId',
        'organizationName',
        'organizationType',
        'organizationExternalId',
      ],
    }).serialize(organization);
  },
};

const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organization) {
    return new Serializer('organization-membership', {
      attributes: [
        'id',
        'updatedAt',
        'organizationRole',
        'organizationId',
        'organizationName',
        'organizationType',
        'organizationExternalId',
      ],
    }).serialize(organization);
  },
};

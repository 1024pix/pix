const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organization) {
    return new Serializer('organization-membership', {
      attributes: [
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

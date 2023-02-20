import { Serializer } from 'jsonapi-serializer';

export default {
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

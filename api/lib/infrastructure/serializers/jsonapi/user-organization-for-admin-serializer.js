import { Serializer } from 'jsonapi-serializer';

const serialize = function (organization) {
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
};

export { serialize };

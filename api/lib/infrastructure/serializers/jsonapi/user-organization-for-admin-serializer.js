import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

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

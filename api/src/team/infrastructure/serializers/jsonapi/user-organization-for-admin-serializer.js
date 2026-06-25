import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organization) {
  return new Serializer('organization-membership', {
    attributes: [
      'organizationRole',
      'organizationId',
      'organizationName',
      'organizationType',
      'organizationExternalId',
      'lastAccessedAt',
    ],
  }).serialize(organization);
};

export const userOrganizationForAdminSerializer = { serialize };

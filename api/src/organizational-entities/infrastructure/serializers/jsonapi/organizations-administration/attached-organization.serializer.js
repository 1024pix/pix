import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizations) {
  return new Serializer('attached-organizations', {
    attributes: ['name', 'externalId'],
  }).serialize(organizations);
};

export const attachedOrganizationSerializer = { serialize };

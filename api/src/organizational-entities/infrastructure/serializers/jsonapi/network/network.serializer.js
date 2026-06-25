import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (networks, meta) {
  return new Serializer('networks', {
    attributes: ['name', 'headOrganization'],
    meta,
  }).serialize(networks);
};

const deserialize = function (json) {
  const attributes = json.data.attributes;

  return {
    networkName: attributes['name'],
    organizationId: attributes['organization-id'],
  };
};

export const networkSerializer = { deserialize, serialize };

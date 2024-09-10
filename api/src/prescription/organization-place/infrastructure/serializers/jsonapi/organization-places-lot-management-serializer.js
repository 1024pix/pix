import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (places) {
  return new Serializer('organization-place', {
    attributes: ['count', 'activationDate', 'expirationDate', 'reference', 'category', 'status', 'creatorFullName'],
  }).serialize(places);
};

const deserialize = function (json) {
  return {
    organizationId: json.data.attributes['organization-id'],
    count: json.data.attributes['count'],
    activationDate: json.data.attributes['activation-date'],
    expirationDate: json.data.attributes['expiration-date'],
    reference: json.data.attributes['reference'],
    category: json.data.attributes['category'],
    createdBy: json.data.attributes['created-by'],
  };
};

export { deserialize, serialize };

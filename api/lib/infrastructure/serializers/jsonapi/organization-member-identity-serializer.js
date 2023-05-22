import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (model) {
  return new Serializer('member-identity', {
    id: 'id',
    attributes: ['firstName', 'lastName'],
  }).serialize(model);
};

export { serialize };

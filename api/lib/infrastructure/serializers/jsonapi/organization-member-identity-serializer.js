import { Serializer } from 'jsonapi-serializer';

const serialize = function (model) {
  return new Serializer('member-identity', {
    id: 'id',
    attributes: ['firstName', 'lastName'],
  }).serialize(model);
};

export { serialize };

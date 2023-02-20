import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(model) {
    return new Serializer('member-identity', {
      id: 'id',
      attributes: ['firstName', 'lastName'],
    }).serialize(model);
  },
};

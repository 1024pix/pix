import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(groups) {
    return new Serializer('groups', {
      id: 'name',
      attributes: ['name'],
    }).serialize(groups);
  },
};

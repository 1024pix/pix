import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(tags) {
    return new Serializer('tags', {
      attributes: ['name'],
    }).serialize(tags);
  },
};

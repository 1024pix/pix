import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(divisions) {
    return new Serializer('divisions', {
      id: 'name',
      attributes: ['name'],
    }).serialize(divisions);
  },
};

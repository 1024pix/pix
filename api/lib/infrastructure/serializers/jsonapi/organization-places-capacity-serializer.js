import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(places) {
    return new Serializer('organization-places-capacity', {
      attributes: ['categories'],
    }).serialize(places);
  },
};

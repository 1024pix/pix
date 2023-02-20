import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(places) {
    return new Serializer('organization-place', {
      attributes: ['count', 'activationDate', 'expirationDate', 'reference', 'category', 'status', 'creatorFullName'],
    }).serialize(places);
  },
};

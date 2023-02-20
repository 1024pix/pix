import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(progression) {
    return new Serializer('progression', {
      attributes: ['completionRate'],
    }).serialize(progression);
  },
};

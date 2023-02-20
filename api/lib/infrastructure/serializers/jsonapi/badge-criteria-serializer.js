import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(badgeCriterion = {}) {
    return new Serializer('badge-criteria', {
      ref: 'id',
      attributes: ['scope', 'threshold'],
    }).serialize(badgeCriterion);
  },
};

import { Serializer } from 'jsonapi-serializer';

const serialize = function (badgeCriterion = {}) {
  return new Serializer('badge-criteria', {
    ref: 'id',
    attributes: ['scope', 'threshold'],
  }).serialize(badgeCriterion);
};

export { serialize };

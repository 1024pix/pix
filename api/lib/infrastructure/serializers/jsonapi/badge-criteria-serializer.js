import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (badgeCriterion = {}) {
  return new Serializer('badge-criteria', {
    ref: 'id',
    attributes: ['scope', 'threshold'],
  }).serialize(badgeCriterion);
};

export { serialize };

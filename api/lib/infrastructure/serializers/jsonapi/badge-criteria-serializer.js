const { Serializer } = require('jsonapi-serializer');
module.exports = {
  serialize(badgeCriterion = {}) {
    return new Serializer('badge-criteria', {
      ref: 'id',
      attributes: ['scope', 'threshold'],
    }).serialize(badgeCriterion);
  },
};

const { Serializer } = require('jsonapi-serializer');
module.exports = {
  serialize(badgeCriterion = {}) {
    return new Serializer('badge-criteria', {
      ref: 'id',
      attributes: ['scope', 'threshold', 'skill'],
    }).serialize(badgeCriterion);
  },

  deserialize(badgeCriterionJson) {
    const { scope, threshold } = badgeCriterionJson.data.attributes;
    return {
      scope,
      threshold,
      skillSetIds: [],
    };
  },
};

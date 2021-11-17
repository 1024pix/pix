const { Serializer } = require('jsonapi-serializer');
module.exports = {
  serialize(badgeCriterion = {}) {
    return new Serializer('badge-criteria', {
      ref: 'id',
      attributes: ['scope', 'threshold'],
    }).serialize(badgeCriterion);
  },

  deserialize(badgeCriterionJson) {
    const { scope, threshold } = badgeCriterionJson.data.attributes;
    const skillSets = badgeCriterionJson.data.relationships?.['skill-sets']?.data ?? [];
    return {
      scope,
      threshold,
      skillSetIds: skillSets.map(({ id }) => id),
    };
  },
};

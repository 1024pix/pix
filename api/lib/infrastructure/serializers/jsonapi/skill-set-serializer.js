const { Serializer } = require('jsonapi-serializer');
module.exports = {
  serialize(skillSet = {}) {
    return new Serializer('skill-sets', {
      ref: 'id',
      attributes: ['name', 'skillIds'],
    }).serialize(skillSet);
  },

  deserialize(skillSetJson) {
    const { name, skillIds } = skillSetJson.data.attributes;
    return {
      name,
      skillIds,
    };
  },
};

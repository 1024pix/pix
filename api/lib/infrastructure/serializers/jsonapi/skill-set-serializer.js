const { Serializer } = require('jsonapi-serializer');
module.exports = {
  serialize(skillSet = {}) {
    return new Serializer('skill-sets', {
      ref: 'id',
      attributes: ['name', 'skillIds'],
    }).serialize(skillSet);
  },

  deserialize(skillSetJson) {
    const { name, 'skill-ids': skillIds } = skillSetJson.data.attributes;
    return {
      name,
      skillIds,
    };
  },
};

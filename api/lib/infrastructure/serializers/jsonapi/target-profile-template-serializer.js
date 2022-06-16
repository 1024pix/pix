const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfileTemplate, meta) {
    return new Serializer('target-profile-template', {
      attributes: ['tubes'],
      tubes: {
        attributes: ['id', 'level'],
      },
      meta,
    }).serialize(targetProfileTemplate);
  },
};

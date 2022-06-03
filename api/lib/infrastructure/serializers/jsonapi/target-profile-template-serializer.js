const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfileTemplate, meta) {
    return new Serializer('target-profile-template', {
      attributes: ['tubes'],
      tubes: {
        attributes: ['tubeId', 'level'],
      },
      meta,
    }).serialize(targetProfileTemplate);
  },
};

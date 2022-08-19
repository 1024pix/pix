const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfileSummaries, meta) {
    return new Serializer('target-profile-summary', {
      attributes: ['name', 'outdated'],
      meta,
    }).serialize(targetProfileSummaries);
  },
};

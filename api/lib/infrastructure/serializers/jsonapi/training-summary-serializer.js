const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(trainingSummaries, meta) {
    return new Serializer('training-summaries', {
      attributes: ['title', 'isRecommendable'],
      meta,
    }).serialize(trainingSummaries);
  },
};

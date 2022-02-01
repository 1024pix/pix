const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(model) {
    return new Serializer('participations-count-by-mastery-rate', {
      id: 'campaignId',
      attributes: ['resultDistribution'],
    }).serialize(model);
  },
};

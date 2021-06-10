const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(model) {
    return new Serializer('campaign-participations-counts-by-status', {
      id: 'campaignId',
      attributes: ['started', 'completed', 'shared'],
    }).serialize(model);
  },
};

const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(model) {
    return new Serializer('campaign-participations-counts-by-day', {
      id: 'campaignId',
      attributes: ['startedParticipations', 'sharedParticipations'],
      startedParticipations: {
        attributes: ['day', 'count'],
      },
      sharedParticipations: {
        attributes: ['day', 'count'],
      },
    }).serialize(model);
  },
};

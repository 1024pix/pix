const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(reports) {
    return new Serializer('campaign-report', {
      attributes: ['participationsCount', 'sharedParticipationsCount', 'stages'],
      stages: {
        ref: 'id',
        included: true,
        attributes: ['title', 'message', 'threshold'],
      },
    }).serialize(reports);
  },
};

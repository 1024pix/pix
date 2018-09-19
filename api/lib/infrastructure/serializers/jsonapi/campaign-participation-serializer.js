const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(campaignParticipation) {
    return new Serializer('campaign-participation', {
      attributes: ['campaignId', 'assessmentId', 'isShared', 'sharedAt'],
    }).serialize([campaignParticipation]);
  },
};

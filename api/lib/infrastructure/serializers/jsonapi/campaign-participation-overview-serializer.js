const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(campaignParticipationOverview) {
    return new Serializer('campaign-participation-overview',
      {
        attributes: ['isShared', 'sharedAt', 'createdAt', 'organizationName', 'assessmentState', 'campaignCode', 'campaignTitle'],
      }).serialize(campaignParticipationOverview);
  },
};

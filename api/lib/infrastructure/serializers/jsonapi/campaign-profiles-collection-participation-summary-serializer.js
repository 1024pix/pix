const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('CampaignProfilesCollectionParticipationSummary', {
      ref: 'id',
      attributes: ['firstName', 'lastName', 'participantExternalId', 'sharedAt'],
    }).serialize(results);
  },
};

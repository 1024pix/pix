const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results, meta) {
    return new Serializer('CampaignProfilesCollectionParticipationSummary', {
      ref: 'id',
      attributes: ['firstName', 'lastName', 'participantExternalId', 'sharedAt'],
      meta,
    }).serialize(results);
  },
};

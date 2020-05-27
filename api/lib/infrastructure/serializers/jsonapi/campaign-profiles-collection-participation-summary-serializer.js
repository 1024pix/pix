const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ data, pagination }) {
    return new Serializer('CampaignProfilesCollectionParticipationSummary', {
      ref: 'id',
      attributes: ['firstName', 'lastName', 'participantExternalId', 'sharedAt'],
      meta: pagination,
    }).serialize(data);
  },
};

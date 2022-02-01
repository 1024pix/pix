const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ campaignParticipantsActivities, pagination }) {
    return new Serializer('campaign-participant-activity', {
      id: 'campaignParticipationId',
      attributes: ['firstName', 'lastName', 'participantExternalId', 'status', 'progression'],
      meta: pagination,
    }).serialize(campaignParticipantsActivities);
  },
};

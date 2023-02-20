import { Serializer } from 'jsonapi-serializer';

export default {
  serialize({ campaignParticipantsActivities, pagination }) {
    return new Serializer('campaign-participant-activity', {
      id: 'campaignParticipationId',
      attributes: ['firstName', 'lastName', 'participantExternalId', 'status', 'progression'],
      meta: pagination,
    }).serialize(campaignParticipantsActivities);
  },
};

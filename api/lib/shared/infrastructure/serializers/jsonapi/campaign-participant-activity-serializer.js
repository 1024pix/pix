import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ campaignParticipantsActivities, pagination }) {
  return new Serializer('campaign-participant-activity', {
    id: 'campaignParticipationId',
    attributes: ['firstName', 'lastName', 'participantExternalId', 'status', 'progression'],
    meta: pagination,
  }).serialize(campaignParticipantsActivities);
};

export { serialize };

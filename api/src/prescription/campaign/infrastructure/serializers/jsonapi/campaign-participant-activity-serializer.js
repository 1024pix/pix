import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ campaignParticipantsActivities, pagination }) {
  return new Serializer('campaign-participant-activity', {
    id: 'organizationLearnerId',
    attributes: [
      'firstName',
      'lastName',
      'participantExternalId',
      'status',
      'lastCampaignParticipationId',
      'participationCount',
    ],
    meta: pagination,
  }).serialize(campaignParticipantsActivities);
};

export const campaignParticipantActivitySerializer = { serialize };

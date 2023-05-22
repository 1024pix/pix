import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ participations, pagination }) {
  return new Serializer('campaign-assessment-result-minimals', {
    id: 'campaignParticipationId',
    attributes: [
      'firstName',
      'lastName',
      'participantExternalId',
      'masteryRate',
      'reachedStage',
      'totalStage',
      'prescriberTitle',
      'prescriberDescription',
      'badges',
    ],
    badges: {
      ref: 'id',
      included: true,
      attributes: ['title', 'altMessage', 'imageUrl'],
    },
    meta: pagination,
  }).serialize(participations);
};

export { serialize };

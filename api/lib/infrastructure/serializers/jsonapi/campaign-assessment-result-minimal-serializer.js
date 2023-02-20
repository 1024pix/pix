import { Serializer } from 'jsonapi-serializer';

export default {
  serialize({ participations, pagination }) {
    return new Serializer('campaign-assessment-result-minimals', {
      id: 'campaignParticipationId',
      attributes: ['firstName', 'lastName', 'participantExternalId', 'masteryRate', 'badges'],
      badges: {
        ref: 'id',
        included: true,
        attributes: ['title', 'altMessage', 'imageUrl'],
      },
      meta: pagination,
    }).serialize(participations);
  },
};

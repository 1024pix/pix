import { Serializer } from 'jsonapi-serializer';

export default {
  serialize({ data, pagination }) {
    return new Serializer('CampaignProfilesCollectionParticipationSummary', {
      ref: 'id',
      attributes: [
        'firstName',
        'lastName',
        'participantExternalId',
        'sharedAt',
        'pixScore',
        'certifiable',
        'certifiableCompetencesCount',
      ],
      meta: pagination,
    }).serialize(data);
  },
};

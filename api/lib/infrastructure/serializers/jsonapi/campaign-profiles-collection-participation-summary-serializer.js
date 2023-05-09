import { Serializer } from 'jsonapi-serializer';

const serialize = function ({ data, pagination }) {
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
};

export { serialize };

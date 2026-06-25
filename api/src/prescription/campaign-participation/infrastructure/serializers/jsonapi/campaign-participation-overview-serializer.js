import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignParticipationOverviews) {
  return new Serializer('campaign-participation-overview', {
    attributes: [
      'isShared',
      'sharedAt',
      'createdAt',
      'organizationName',
      'status',
      'campaignCode',
      'campaignTitle',
      'disabledAt',
      'masteryRate',
      'validatedStagesCount',
      'totalStagesCount',
      'canRetry',
      'campaignType',
    ],
  }).serialize(campaignParticipationOverviews);
};

export const campaignParticipationOverviewSerializer = { serialize };

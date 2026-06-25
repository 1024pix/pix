import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (statistics) {
  return new Serializer('participation-statistics', {
    attributes: ['totalParticipationCount', 'completedParticipationCount', 'sharedParticipationCountLastThirtyDays'],
  }).serialize(statistics);
};

export const campaignParticipationStatisticsSerializer = { serialize };

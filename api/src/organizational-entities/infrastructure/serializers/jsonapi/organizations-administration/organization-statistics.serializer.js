import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (statistics) {
  return new Serializer('organization-statistics', {
    attributes: ['organizationId', 'totalParticipantsCount', 'totalParticipantsCountByYear'],
  }).serialize(statistics);
};

export { serialize };

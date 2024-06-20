import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (anonymizedResults) {
  return new Serializer('anonymize-gar-results', {
    attributes: ['anonymizedUserCount', 'total', 'userIds'],
  }).serialize(anonymizedResults);
};

export const anonymizeGarResultSerializer = { serialize };

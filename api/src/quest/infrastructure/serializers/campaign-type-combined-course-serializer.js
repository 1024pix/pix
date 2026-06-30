import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaign) {
  return new Serializer('campaign', {
    attributes: ['name', 'code', 'type'],
  }).serialize(campaign);
};

export const campaignTypeCombinedCourseSerializer = { serialize };

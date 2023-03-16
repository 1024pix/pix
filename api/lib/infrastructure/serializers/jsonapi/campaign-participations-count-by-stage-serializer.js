import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (model) {
  return new Serializer('campaign-participations-count-by-stage', {
    id: 'campaignId',
    attributes: ['data'],
    data: {
      attributes: ['id', 'value', 'title', 'description', 'reachedStage', 'totalStage'],
    },
  }).serialize(model);
};

export { serialize };

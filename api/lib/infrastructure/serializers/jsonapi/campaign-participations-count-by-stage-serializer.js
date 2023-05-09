import { Serializer } from 'jsonapi-serializer';

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

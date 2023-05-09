import { Serializer } from 'jsonapi-serializer';

const serialize = function (model) {
  return new Serializer('campaign-participations-counts-by-status', {
    id: 'campaignId',
    attributes: ['started', 'completed', 'shared'],
  }).serialize(model);
};

export { serialize };

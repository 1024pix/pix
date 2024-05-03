import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (availableCampaignParticipation, meta) {
  return new Serializer('available-campaign-participation', {
    attributes: ['sharedAt', 'status'],
    meta,
  }).serialize(availableCampaignParticipation);
};

export { serialize };

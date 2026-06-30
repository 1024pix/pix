import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (places) {
  return new Serializer('organization-places-statistics', {
    attributes: ['total', 'occupied', 'available', 'anonymousSeat', 'hasReachedMaximumPlacesLimit'],
  }).serialize(places);
};

export const organizationPlacesStatisticsSerializer = { serialize };

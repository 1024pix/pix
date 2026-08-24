import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (informationBanner) {
  return new Serializer('information-banners', {
    attributes: ['banners'],
    banners: {
      included: true,
      ref: 'id',
      attributes: ['severity', 'message'],
    },
  }).serialize(informationBanner);
};

export const informationBannerSerializer = { serialize };

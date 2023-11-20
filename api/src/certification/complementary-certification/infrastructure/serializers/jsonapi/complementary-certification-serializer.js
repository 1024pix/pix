import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serializeForAdmin = function (complementaryCertification) {
  return new Serializer('complementary-certification', {
    attributes: ['label', 'hasExternalJury', 'targetProfilesHistory'],
    targetProfilesHistory: {
      attributes: ['id', 'name', 'attachedAt', 'detachedAt', 'badges'],
      badges: {
        attributes: ['id', 'label', 'level', 'imageUrl', 'minimumEarnedPix'],
      },
    },
  }).serialize(complementaryCertification);
};

export { serializeForAdmin };

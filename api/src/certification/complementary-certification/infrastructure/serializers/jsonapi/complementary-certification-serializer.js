import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serializeForAdmin = function (complementaryCertification) {
  const tutu = new Serializer('complementary-certification', {
    attributes: ['label', 'hasExternalJury', 'targetProfilesHistory'],
    targetProfilesHistory: {
      attributes: ['id', 'name', 'attachedAt', 'detachedAt', 'badges'],
      badges: {
        attributes: ['id', 'label', 'level', 'imageUrl'],
      },
    },
  }).serialize(complementaryCertification);
  return tutu;
};

export { serializeForAdmin };

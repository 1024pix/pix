import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (complementaryCertifications) {
  return new Serializer('complementary-certification', {
    attributes: ['label', 'key'],
  }).serialize(complementaryCertifications);
};

export { serialize };

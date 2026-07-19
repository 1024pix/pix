import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(complementaryCertifications) {
  return new Serializer('complementary-certification', {
    attributes: ['label', 'key', 'hasComplementaryReferential'],
  }).serialize(complementaryCertifications);
}

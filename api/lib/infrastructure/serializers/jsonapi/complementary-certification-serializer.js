import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { ComplementaryCertification } from '../../../domain/models/index.js';

const serialize = function (complementaryCertifications) {
  return new Serializer('complementary-certification', {
    attributes: ['label', 'key'],
  }).serialize(complementaryCertifications);
};

const deserialize = function (jsonAPI) {
  return new ComplementaryCertification({
    id: jsonAPI.data.id,
    label: jsonAPI.data.attributes.label,
    key: jsonAPI.data.attributes.key,
  });
};

export { serialize, deserialize };

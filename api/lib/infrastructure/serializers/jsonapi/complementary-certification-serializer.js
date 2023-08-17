import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { ComplementaryCertification } from '../../../domain/models/ComplementaryCertification.js';

const serialize = function (complementaryCertifications) {
  return new Serializer('complementary-certification', {
    attributes: ['label', 'key'],
  }).serialize(complementaryCertifications);
};

const serializeForAdmin = function (complementaryCertification) {
  return new Serializer('complementary-certification', {
    attributes: ['label', 'key', 'targetProfilesHistory'],
    targetProfilesHistory: {
      attributes: ['id', 'name', 'attachedAt', 'detachedAt', 'badges'],
      badges: {
        attributes: ['id', 'label', 'level'],
      },
    },
  }).serialize(complementaryCertification);
};

const deserialize = function (jsonAPI) {
  return new ComplementaryCertification({
    id: jsonAPI.data.id,
    label: jsonAPI.data.attributes.label,
    key: jsonAPI.data.attributes.key,
  });
};

export { deserialize, serialize, serializeForAdmin };

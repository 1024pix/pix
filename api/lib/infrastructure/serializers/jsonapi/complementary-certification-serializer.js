import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { ComplementaryCertification } from '../../../domain/models/ComplementaryCertification.js';

const serialize = function (habilitation) {
  return new Serializer('habilitation', {
    attributes: ['label', 'key'],
  }).serialize(habilitation);
};

const deserialize = function (jsonAPI) {
  return new ComplementaryCertification({
    id: jsonAPI.data.id,
    label: jsonAPI.data.attributes.label,
    key: jsonAPI.data.attributes.key,
  });
};

export { serialize, deserialize };

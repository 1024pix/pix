import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer } = jsonapiSerializer;
import BadgeCriterion from '../../../domain/models/BadgeCriterion.js';

const deserialize = async function (payload) {
  const deserializedPayload = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);

  return new BadgeCriterion({ ...deserializedPayload });
};

export { deserialize };

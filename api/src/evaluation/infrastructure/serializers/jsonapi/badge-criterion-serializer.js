import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer } = jsonapiSerializer;

import BadgeCriterion from '../../../domain/models/BadgeCriterion.js';

const deserialize = async function (payload) {
  const deserializedPayload = await new Deserializer({
    keyForAttribute: 'camelCase',
    badges: {
      valueForRelationship: function (relationship) {
        return relationship.id;
      },
    },
    transform: function (record) {
      record['badgeId'] = record['badge'];
      delete record['badge'];
      return record;
    },
  }).deserialize(payload);

  return new BadgeCriterion({ ...deserializedPayload });
};

export { deserialize };

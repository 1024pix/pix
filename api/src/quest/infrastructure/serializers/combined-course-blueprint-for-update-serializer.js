import jsonapiSerializer from 'jsonapi-serializer';

import { CombinedCourseBlueprintForUpdate } from '../../domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForUpdate.js';

const { Deserializer } = jsonapiSerializer;

const deserialize = async function (payload) {
  const deserializedData = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);
  return new CombinedCourseBlueprintForUpdate(deserializedData);
};

export { deserialize };

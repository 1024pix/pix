import jsonapiSerializer from 'jsonapi-serializer';

import { CombinedCourseBlueprintForCreation } from '../../domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForCreation.js';

const { Deserializer, Serializer } = jsonapiSerializer;

const serialize = function (combinedCourseBlueprint) {
  return new Serializer('combined-course-blueprints', {
    attributes: [
      'name',
      'internalName',
      'description',
      'prescriberDescription',
      'illustration',
      'surveyLink',
      'rewardRequirementsDescription',
      'createdAt',
      'updatedAt',
    ],
  }).serialize(combinedCourseBlueprint);
};

const deserialize = async function (payload) {
  const deserializedData = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);

  return new CombinedCourseBlueprintForCreation({
    ...deserializedData,
  });
};

export const combinedCourseBlueprintForCreationSerializer = { deserialize, serialize };

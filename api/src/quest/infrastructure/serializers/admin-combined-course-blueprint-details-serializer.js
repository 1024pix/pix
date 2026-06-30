import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (adminCombinedCourseBlueprintDetails) {
  return new Serializer('combined-course-blueprints', {
    attributes: [
      'name',
      'internalName',
      'description',
      'illustration',
      'content',
      'surveyLink',
      'createdAt',
      'updatedAt',
      'attestationLabel',
    ],
  }).serialize(adminCombinedCourseBlueprintDetails);
};

export const adminCombinedCourseBlueprintDetailsSerializer = { serialize };

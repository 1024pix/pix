import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (adminCombinedCourseBlueprintDetails) {
  return new Serializer('combined-course-blueprints', {
    attributes: [
      'name',
      'internalName',
      'description',
      'prescriberDescription',
      'illustration',
      'content',
      'surveyLink',
      'createdAt',
      'updatedAt',
      'attestationLabel',
      'rewardRequirementsDescription',
      'rewardRequirements',
    ],
    rewardRequirements: {
      ref: 'id',
      included: true,
      attributes: ['name', 'cappedTubesThreshold', 'areas'],
    },
  }).serialize(adminCombinedCourseBlueprintDetails);
};

export const adminCombinedCourseBlueprintDetailsSerializer = { serialize };

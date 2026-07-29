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
      'rewardRequirementsDescription',
      'rewardRequirements',
    ],
    rewardRequirements: {
      ref: 'id',
      included: true,
      attributes: ['cappedTubesThreshold', 'areas'],
      areas: {
        ref: 'id',
        included: true,
        attributes: ['title', 'code', 'color', 'competences'],
        competences: {
          ref: 'id',
          included: true,
          attributes: ['name', 'index', 'thematics'],
          thematics: {
            ref: 'id',
            included: true,
            attributes: ['name', 'index', 'tubes'],
            tubes: {
              ref: 'id',
              included: true,
              attributes: ['level', 'name', 'practicalTitle'],
            },
          },
        },
      },
    },
  }).serialize(adminCombinedCourseBlueprintDetails);
};

export const adminCombinedCourseBlueprintDetailsSerializer = { serialize };

import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourseBlueprint) {
  return new Serializer('combined-course-blueprint-overview', {
    attributes: ['name', 'internalName', 'description', 'illustration', 'createdAt', 'updatedAt', 'items'],
    items: {
      ref: 'id',
      included: true,
      attributes: ['name', 'type', 'duration', 'image', 'isRecommendable'],
    },
    typeForAttribute: (attribute) => {
      if (attribute === 'items') return 'combined-course-blueprint-items';
      else return attribute;
    },
  }).serialize(combinedCourseBlueprint);
};

export const combinedCourseBlueprintOverviewSerializer = { serialize };

import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourse) {
  return new Serializer('combined-courses', {
    attributes: [
      'name',
      'code',
      'organizationId',
      'status',
      'description',
      'illustration',
      'items',
      'reward',
      'shortId',
    ],
    items: {
      ref: 'id',
      included: true,
      attributes: [
        'title',
        'reference',
        'type',
        'redirection',
        'isCompleted',
        'isLocked',
        'masteryRate',
        'validatedStagesCount',
        'totalStagesCount',
        'duration',
        'image',
        'shortId',
      ],
    },
    reward: {
      ref: 'id',
      included: true,
      attributes: ['status', 'type', 'label', 'templateName', 'data'],
    },
    typeForAttribute: (attribute) => {
      if (attribute === 'items') return 'combined-course-items';
      if (attribute === 'reward') return 'combined-course-rewards';
      return attribute;
    },
  }).serialize(combinedCourse);
};

export { serialize };

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
      'surveyUrl',
      'parentCode',
      'parentName',
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
        'childItems',
      ],
      // the activities of a nested course are serialized as combined course items too,
      // so the front renders them with the very same component
      childItems: {
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
    },
    reward: {
      ref: 'id',
      included: true,
      attributes: ['status', 'type', 'requirementsDescription', 'label', 'templateName', 'data'],
    },
    typeForAttribute: (attribute) => {
      if (attribute === 'items' || attribute === 'childItems') return 'combined-course-items';
      if (attribute === 'reward') return 'combined-course-rewards';
      return attribute;
    },
  }).serialize(combinedCourse);
};

export const combinedCourseSerializer = { serialize };

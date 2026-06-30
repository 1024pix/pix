import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourseParticipation) {
  return new Serializer('combined-course-participation-details', {
    attributes: ['participation', 'items'],
    participation: {
      ref: 'id',
      included: true,
      attributes: ['firstName', 'lastName'],
    },
    items: {
      ref: 'id',
      included: true,
      attributes: [
        'title',
        'type',
        'masteryRate',
        'participationStatus',
        'isCompleted',
        'isLocked',
        'totalStagesCount',
        'validatedStagesCount',
      ],
    },
    typeForAttribute: (attribute) => {
      if (attribute === 'participation') return 'combined-course-participations';
      if (attribute === 'items') return 'combined-course-items';
      else return attribute;
    },
  }).serialize(combinedCourseParticipation);
};

export const combinedCourseParticipationDetailSerializer = { serialize };

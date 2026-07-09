import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourse) {
  return new Serializer('combined-courses', {
    attributes: [
      'name',
      'code',
      'hasCampaigns',
      'hasModules',
      'hasReward',
      'campaignIds',
      'combinedCourseParticipations',
      'combinedCourseStatistics',
    ],
    combinedCourseStatistics: {
      ref: 'id',
      nullIfMissing: true,
      ignoreRelationshipData: true,
      relationshipLinks: {
        related: function (record) {
          return `/api/combined-courses/${record.id}/statistics`;
        },
      },
    },
    combinedCourseParticipations: {
      ref: 'id',
      nullIfMissing: true,
      ignoreRelationshipData: true,
      relationshipLinks: {
        related: function (record) {
          return `/api/combined-courses/${record.id}/participations`;
        },
      },
    },
  }).serialize(combinedCourse);
};

export const combinedCourseDetailsSerializer = { serialize };

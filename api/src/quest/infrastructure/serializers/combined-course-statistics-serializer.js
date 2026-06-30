import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourseStatistics) {
  return new Serializer('combined-course-statistics', {
    attributes: ['participationsCount', 'completedParticipationsCount'],
  }).serialize(combinedCourseStatistics);
};

export const combinedCourseStatisticsSerializer = { serialize };

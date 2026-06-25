import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourse, meta) {
  return new Serializer('combined-courses', {
    attributes: ['name', 'code', 'participationsCount', 'completedParticipationsCount'],
    meta,
  }).serialize(combinedCourse);
};

export const combinedCourseListSerializer = { serialize };

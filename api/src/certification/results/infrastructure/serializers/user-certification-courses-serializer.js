import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(userCertificationCourses) {
  return new Serializer('user-certification-course', {
    transform(currentCertificationCourse) {
      return currentCertificationCourse.toDTO();
    },
    attributes: ['id', 'createdAt', 'isPublished', 'sessionId'],
  }).serialize(userCertificationCourses);
}

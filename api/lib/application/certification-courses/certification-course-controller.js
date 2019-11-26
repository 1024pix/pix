const certificationService = require('../../domain/services/certification-service');
const certificationCourseService = require('../../domain/services/certification-course-service');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const usecases = require('../../domain/usecases');

module.exports = {

  computeResult(request) {
    const certificationCourseId = request.params.id;

    return certificationService.calculateCertificationResultByCertificationCourseId(certificationCourseId);
  },

  getResult(request) {
    const certificationCourseId = request.params.id;
    return certificationService.getCertificationResult(certificationCourseId)
      .then(certificationCourseSerializer.serializeResult);
  },

  update(request) {
    return certificationSerializer.deserialize(request.payload)
      .then((certificationCourse) => certificationCourseService.update(certificationCourse))
      .then(certificationSerializer.serializeFromCertificationCourse);
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];
    const sessionId = request.payload.data.attributes['session-id'];

    const { created, certificationCourse } =
      await usecases.retrieveLastOrCreateCertificationCourse({ sessionId, accessCode, userId });

    const serialized = await certificationCourseSerializer.serialize(certificationCourse);

    return created ? h.response(serialized).created() : serialized;
  },

  async get(request) {
    const certificationCourseId = request.params.id;
    const userId = request.auth.credentials.userId;

    const certificationCourse = await usecases.getCertificationCourse({ userId, certificationCourseId });

    return certificationCourseSerializer.serialize(certificationCourse);
  },
};

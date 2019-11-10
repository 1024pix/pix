const certificationService = require('../../domain/services/certification-service');
const certificationCourseService = require('../../../lib/domain/services/certification-course-service');
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

  save(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];

    return usecases.retrieveLastOrCreateCertificationCourse({ accessCode, userId })
      .then(({ created, certificationCourse }) => {
        const serialized = certificationCourseSerializer.serialize(certificationCourse);

        return created ? h.response(serialized).created() : serialized;
      });
  }
};

const certificationService = require('../../domain/services/certification-service');
const certificationCourseService = require('../../../lib/domain/services/certification-course-service');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  computeResult(request, h) {
    const certificationCourseId = request.params.id;

    return certificationService.calculateCertificationResultByCertificationCourseId(certificationCourseId)
      .catch((error) => errorManager.send(h, error));
  },

  getResult(request, h) {
    const certificationCourseId = request.params.id;
    return certificationService.getCertificationResult(certificationCourseId)
      .then(certificationCourseSerializer.serializeResult)
      .catch((error) => errorManager.send(h, error));
  },

  update(request, h) {
    return certificationSerializer.deserialize(request.payload)
      .then((certificationCourse) => certificationCourseService.update(certificationCourse))
      .then(certificationSerializer.serializeFromCertificationCourse)
      .catch((error) => errorManager.send(h, error));
  },
};

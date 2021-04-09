const certificationService = require('../../domain/services/certification-service');
const certificationCourseService = require('../../domain/services/certification-course-service');
const certificationDetailsSerializer = require('../../infrastructure/serializers/jsonapi/certification-details-serializer');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationResultInformationSerializer = require('../../infrastructure/serializers/jsonapi/certification-result-information-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const certifiedProfileRepository = require('../../infrastructure/repositories/certified-profile-repository');
const certifiedProfileSerializer = require('../../infrastructure/serializers/jsonapi/certified-profile-serializer');
const usecases = require('../../domain/usecases');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = {

  computeResult(request) {
    const certificationCourseId = request.params.id;
    return certificationService.calculateCertificationResultByCertificationCourseId(certificationCourseId);
  },

  async getCertificationDetails(request) {
    const certificationCourseId = request.params.id;
    const certificationDetails = await usecases.getCertificationDetails({ certificationCourseId });

    return certificationDetailsSerializer.serialize(certificationDetails);
  },

  async getCertificationResultInformation(request) {
    const certificationCourseId = request.params.id;
    const certificationResultInformation = await usecases.getCertificationResultInformation({ certificationCourseId });
    return certificationResultInformationSerializer.serialize(certificationResultInformation);
  },

  async update(request) {
    const certificationCourse = await certificationSerializer.deserialize(request.payload);
    const updatedCertificationCourse = await certificationCourseService.update(certificationCourse);
    return certificationSerializer.serializeFromCertificationCourse(updatedCertificationCourse);
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];
    const sessionId = request.payload.data.attributes['session-id'];

    const { created, certificationCourse } = await DomainTransaction.execute((domainTransaction) => {
      return usecases.retrieveLastOrCreateCertificationCourse({ domainTransaction, sessionId, accessCode, userId });
    });

    const serialized = await certificationCourseSerializer.serialize(certificationCourse);

    return created ? h.response(serialized).created() : serialized;
  },

  async get(request) {
    const certificationCourseId = request.params.id;
    const userId = request.auth.credentials.userId;

    const certificationCourse = await usecases.getCertificationCourse({ userId, certificationCourseId });

    return certificationCourseSerializer.serialize(certificationCourse);
  },

  async getCertifiedProfile(request) {
    const certificationCourseId = request.params.id;
    const certifiedProfile = await certifiedProfileRepository.get(certificationCourseId);
    return certifiedProfileSerializer.serialize(certifiedProfile);
  },
};

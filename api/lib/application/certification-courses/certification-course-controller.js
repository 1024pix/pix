const certificationDetailsSerializer = require('../../infrastructure/serializers/jsonapi/certification-details-serializer');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const juryCertificationSerializer = require('../../infrastructure/serializers/jsonapi/jury-certification-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const certifiedProfileRepository = require('../../infrastructure/repositories/certified-profile-repository');
const certifiedProfileSerializer = require('../../infrastructure/serializers/jsonapi/certified-profile-serializer');
const usecases = require('../../domain/usecases');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');
const { isEndTestScreenRemovalEnabledBySessionId } = require('../../domain/services/end-test-screen-removal-service');

module.exports = {
  async getCertificationDetails(request) {
    const certificationCourseId = request.params.id;
    const certificationDetails = await usecases.getCertificationDetails({ certificationCourseId });

    return certificationDetailsSerializer.serialize(certificationDetails);
  },

  async getJuryCertification(request) {
    const certificationCourseId = request.params.id;
    const juryCertification = await usecases.getJuryCertification({ certificationCourseId });
    return juryCertificationSerializer.serialize(juryCertification);
  },

  async update(request) {
    const certificationCourseId = request.params.id;
    const userId = request.auth.credentials.userId;
    const command = await certificationSerializer.deserializeCertificationCandidateModificationCommand(
      request.payload,
      certificationCourseId,
      userId
    );
    await usecases.correctCandidateIdentityInCertificationCourse({ command });
    const updatedCertificationCourse = await usecases.getCertificationCourse({
      userId: command.userId,
      certificationCourseId: command.certificationCourseId,
    });
    return certificationSerializer.serializeFromCertificationCourse(updatedCertificationCourse);
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];
    const sessionId = request.payload.data.attributes['session-id'];
    const locale = extractLocaleFromRequest(request);

    const { created, certificationCourse } = await DomainTransaction.execute((domainTransaction) => {
      return usecases.retrieveLastOrCreateCertificationCourse({
        domainTransaction,
        sessionId,
        accessCode,
        userId,
        locale,
      });
    });

    const serialized = await certificationCourseSerializer.serialize(certificationCourse);

    return created ? h.response(serialized).created() : serialized;
  },

  async get(request) {
    const certificationCourseId = request.params.id;
    const userId = request.auth.credentials.userId;

    const certificationCourse = await usecases.getCertificationCourse({ userId, certificationCourseId });
    const isEndScreenRemoveEnabled = await isEndTestScreenRemovalEnabledBySessionId(certificationCourse.getSessionId());
    return certificationCourseSerializer.serialize(certificationCourse, isEndScreenRemoveEnabled);
  },

  async getCertifiedProfile(request) {
    const certificationCourseId = request.params.id;
    const certifiedProfile = await certifiedProfileRepository.get(certificationCourseId);
    return certifiedProfileSerializer.serialize(certifiedProfile);
  },

  async cancel(request, h) {
    const certificationCourseId = request.params.id;
    await usecases.cancelCertificationCourse({ certificationCourseId });
    return h.response().code(200);
  },

  async uncancel(request, h) {
    const certificationCourseId = request.params.id;
    await usecases.uncancelCertificationCourse({ certificationCourseId });
    return h.response().code(200);
  },
};

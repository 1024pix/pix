const certificationDetailsSerializer = require('../../infrastructure/serializers/jsonapi/certification-details-serializer');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const juryCertificationSerializer = require('../../infrastructure/serializers/jsonapi/jury-certification-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const certifiedProfileRepository = require('../../infrastructure/repositories/certified-profile-repository');
const certifiedProfileSerializer = require('../../infrastructure/serializers/jsonapi/certified-profile-serializer');
const usecases = require('../../domain/usecases');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

const AssessmentResult = require('../../domain/models/AssessmentResult');
const CompetenceMark = require('../../domain/models/CompetenceMark');
const assessmentResultService = require('../../domain/services/assessment-result-service');

const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

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
    const certificationCourse = await usecases.getCertificationCourse({ certificationCourseId });
    return certificationCourseSerializer.serialize(certificationCourse);
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

  async saveAssessmentResult(request) {
    const jsonResult = request.payload.data.attributes;
    const certificationCourseId = request.params.id;
    const { assessmentResult, competenceMarks } = _deserializeResultsAdd(jsonResult);
    const juryId = request.auth.credentials.userId;
    // FIXME (re)calculate partner certifications which may be invalidated/validated
    await assessmentResultService.save({
      certificationCourseId,
      assessmentResult: { ...assessmentResult, juryId },
      competenceMarks,
    });
    return null;
  },
};

// TODO: Should be removed and replaced by a real serializer
function _deserializeResultsAdd(json) {
  const assessmentResult = new AssessmentResult({
    assessmentId: json['assessment-id'],
    emitter: json.emitter,
    status: json.status,
    commentForJury: json['comment-for-jury'],
    commentForCandidate: json['comment-for-candidate'],
    commentForOrganization: json['comment-for-organization'],
    pixScore: json['pix-score'],
  });

  const competenceMarks = json['competences-with-mark'].map((competenceMark) => {
    return new CompetenceMark({
      level: competenceMark.level,
      score: competenceMark.score,
      area_code: competenceMark.area_code,
      competence_code: competenceMark.competence_code,
      competenceId: competenceMark['competenceId'],
    });
  });
  return { assessmentResult, competenceMarks };
}

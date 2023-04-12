const certificationDetailsSerializer = require('../../infrastructure/serializers/jsonapi/certification-details-serializer.js');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer.js');
const juryCertificationSerializer = require('../../infrastructure/serializers/jsonapi/jury-certification-serializer.js');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer.js');
const certifiedProfileRepository = require('../../infrastructure/repositories/certified-profile-repository.js');
const certifiedProfileSerializer = require('../../infrastructure/serializers/jsonapi/certified-profile-serializer.js');
const usecases = require('../../domain/usecases/index.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');

const AssessmentResult = require('../../domain/models/AssessmentResult.js');
const CompetenceMark = require('../../domain/models/CompetenceMark.js');
const assessmentResultService = require('../../domain/services/assessment-result-service.js');

const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  async getCertificationDetails(request, h, dependencies = { certificationDetailsSerializer }) {
    const certificationCourseId = request.params.id;
    const certificationDetails = await usecases.getCertificationDetails({ certificationCourseId });

    return dependencies.certificationDetailsSerializer.serialize(certificationDetails);
  },

  async getJuryCertification(request, h, dependencies = { juryCertificationSerializer }) {
    const certificationCourseId = request.params.id;
    const juryCertification = await usecases.getJuryCertification({ certificationCourseId });
    return dependencies.juryCertificationSerializer.serialize(juryCertification);
  },

  async update(request, h, dependencies = { certificationSerializer }) {
    const certificationCourseId = request.params.id;
    const userId = request.auth.credentials.userId;
    const command = await dependencies.certificationSerializer.deserializeCertificationCandidateModificationCommand(
      request.payload,
      certificationCourseId,
      userId
    );
    await usecases.correctCandidateIdentityInCertificationCourse({ command });
    const updatedCertificationCourse = await usecases.getCertificationCourse({
      certificationCourseId: command.certificationCourseId,
    });
    return dependencies.certificationSerializer.serializeFromCertificationCourse(updatedCertificationCourse);
  },

  async save(request, h, dependencies = { extractLocaleFromRequest, certificationCourseSerializer }) {
    const userId = request.auth.credentials.userId;
    const accessCode = request.payload.data.attributes['access-code'];
    const sessionId = request.payload.data.attributes['session-id'];
    const locale = dependencies.extractLocaleFromRequest(request);

    const { created, certificationCourse } = await DomainTransaction.execute((domainTransaction) => {
      return usecases.retrieveLastOrCreateCertificationCourse({
        domainTransaction,
        sessionId,
        accessCode,
        userId,
        locale,
      });
    });

    const serialized = await dependencies.certificationCourseSerializer.serialize(certificationCourse);

    return created ? h.response(serialized).created() : serialized;
  },

  async get(request, h, dependencies = { certificationCourseSerializer }) {
    const certificationCourseId = request.params.id;
    const certificationCourse = await usecases.getCertificationCourse({ certificationCourseId });
    return dependencies.certificationCourseSerializer.serialize(certificationCourse);
  },

  async getCertifiedProfile(request, h, dependencies = { certifiedProfileRepository, certifiedProfileSerializer }) {
    const certificationCourseId = request.params.id;
    const certifiedProfile = await dependencies.certifiedProfileRepository.get(certificationCourseId);
    return dependencies.certifiedProfileSerializer.serialize(certifiedProfile);
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

  async saveAssessmentResult(request, h, dependencies = { assessmentResultService }) {
    const jsonResult = request.payload.data.attributes;
    const certificationCourseId = request.params.id;
    const { assessmentResult, competenceMarks } = _deserializeResultsAdd(jsonResult);
    const juryId = request.auth.credentials.userId;
    // FIXME (re)calculate partner certifications which may be invalidated/validated
    await dependencies.assessmentResultService.save({
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

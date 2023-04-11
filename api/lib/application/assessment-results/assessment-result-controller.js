const AssessmentResult = require('../../domain/models/AssessmentResult.js');
const CompetenceMark = require('../../domain/models/CompetenceMark.js');
const assessmentResultService = require('../../domain/services/assessment-result-service.js');

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

module.exports = {
  async save(request, h, dependencies = { assessmentResultService }) {
    const jsonResult = request.payload.data.attributes;
    const { assessmentResult, competenceMarks } = _deserializeResultsAdd(jsonResult);
    const juryId = request.auth.credentials.userId;
    // FIXME (re)calculate partner certifications which may be invalidated/validated
    await dependencies.assessmentResultService.save({ ...assessmentResult, juryId }, competenceMarks);
    return null;
  },
};

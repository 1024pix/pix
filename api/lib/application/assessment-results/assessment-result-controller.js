const AssessmentResult = require('../../domain/models/AssessmentResult');
const CompetenceMark = require('../../domain/models/CompetenceMark');
const assessmentResultService = require('../../domain/services/assessment-result-service');

// TODO: Should be removed and replaced by a real serializer
function _deserializeResultsAdd(json) {
  const assessmentResult = new AssessmentResult({
    assessmentId: json['assessment-id'],
    emitter: json.emitter,
    status: json.status,
    commentForJury: json['comment-for-jury'],
    commentForCandidate: json['comment-for-candidate'],
    commentForOrganization: json['comment-for-organization'],
    level: json.level,
    pixScore: json['pix-score'],
  });

  const competenceMarks = json['competences-with-mark'].map((competenceMark) => {
    return new CompetenceMark({
      level: competenceMark.level,
      score: competenceMark.score,
      area_code: competenceMark['area-code'],
      competence_code: competenceMark['competence-code'],
    });
  });
  return { assessmentResult, competenceMarks };
}

module.exports = {

  save(request) {
    const jsonResult = request.payload.data.attributes;

    const { assessmentResult, competenceMarks } = _deserializeResultsAdd(jsonResult);
    assessmentResult.juryId = request.auth.credentials.userId;
    // FIXME (re)calculate partner certification acquisitions
    return assessmentResultService.save(assessmentResult, competenceMarks)
      .then(() => null);
  },
};

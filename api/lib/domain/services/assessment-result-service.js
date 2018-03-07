const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../lib/infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../../lib/infrastructure/repositories/competence-mark-repository');
const CompetenceMark = require('../models/CompetenceMark');
const AssessmentResult = require('../models/AssessmentResult');

module.exports = {

  save(assessmentResultInfo) {
    const certificationId = assessmentResultInfo['certification-id'];
    const competenceMarks = assessmentResultInfo['competences-with-mark'];

    return assessmentRepository.getByCertificationCourseId(certificationId)
      .then((assessment) => {

        const assessmentResult = {
          assessmentId: assessment.id,
          emitter: assessmentResultInfo.emitter,
          status: assessmentResultInfo.status,
          comment: assessmentResultInfo.comment,
          level: assessmentResultInfo.level,
          pixScore: assessmentResultInfo['pix-score'],
        };
        return assessmentResultRepository.save(new AssessmentResult(assessmentResult));
      })
      .then((assessmentResult) => {

        const competenceMarksSaved = competenceMarks.map((competenceMark) => {
          const competenceMarkSaved = {
            level: competenceMark.level,
            score: competenceMark.score,
            area_code: competenceMark['area-code'],
            competence_code: competenceMark['competence-code'],
            assessmentResultId: assessmentResult.id
          };

          return competenceMarkRepository.save(new CompetenceMark(competenceMarkSaved));
        });
        return Promise.all(competenceMarksSaved);
      });
  }

};

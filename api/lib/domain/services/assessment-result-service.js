const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../lib/infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../../lib/infrastructure/repositories/competence-mark-repository');
const CompetenceMark = require('../models/CompetenceMark');
const AssessmentResult = require('../models/AssessmentResult');

module.exports = {

  save(assessmentResultInfo) {
    const certificationId = assessmentResultInfo.certificationId;
    const competenceMarks = assessmentResultInfo.competenceMarks;

    return assessmentRepository.getByCertificationCourseId(certificationId)
      .then((assessment) => {

        const assessmentResult = {
          assessmentId: assessment.id,
          emitter: assessmentResultInfo.emitter,
          comment: assessmentResultInfo.comment,
          level: assessmentResultInfo.level,
          pixScore: assessmentResultInfo.pixScore,
        };
        return assessmentResultRepository.save(new AssessmentResult(assessmentResult));
      })
      .then((assessmentResult) => {

        const competenceMarksSaved = competenceMarks.map((competenceMark) => {
          competenceMark.assessmentResultId = assessmentResult.id;
          return competenceMarkRepository.save(new CompetenceMark(competenceMark));
        });
        return Promise.all(competenceMarksSaved);
      });
  }

};

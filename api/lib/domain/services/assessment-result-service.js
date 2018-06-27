const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');

function _validatedDataForAllCompetenceMark(marks) {
  return Promise.all(marks.map((mark) => mark.validate()));
}

function save(assessmentResult, competenceMarks) {

  return _validatedDataForAllCompetenceMark(competenceMarks)
    .then(() => assessmentResultRepository.save(assessmentResult))
    .then((assessmentResult) => {
      const competenceMarksSaved = competenceMarks.map((competenceMark) => {
        competenceMark.assessmentResultId = assessmentResult.id;
        return competenceMarkRepository.save(competenceMark);
      });
      return Promise.all(competenceMarksSaved);
    });
}

module.exports = {
  save,
};

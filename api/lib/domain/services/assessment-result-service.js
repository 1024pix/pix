const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository.js');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository.js');
const CompetenceMark = require('../models/CompetenceMark.js');
const bluebird = require('bluebird');

async function _validatedDataForAllCompetenceMark(competenceMarks) {
  for (const competenceMark of competenceMarks) {
    competenceMark.validate();
  }
}

async function save({ certificationCourseId, assessmentResult, competenceMarks }) {
  await _validatedDataForAllCompetenceMark(competenceMarks);
  const { id: assessmentResultId } = await assessmentResultRepository.save({ certificationCourseId, assessmentResult });
  return bluebird.mapSeries(competenceMarks, (competenceMark) =>
    competenceMarkRepository.save(new CompetenceMark({ ...competenceMark, assessmentResultId }))
  );
}

module.exports = {
  save,
};

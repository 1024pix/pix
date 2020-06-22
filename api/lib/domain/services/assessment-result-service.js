const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const CompetenceMark = require('../models/CompetenceMark');
const bluebird = require('bluebird');

async function _validatedDataForAllCompetenceMark(competenceMarks) {
  for (const competenceMark of competenceMarks) {
    competenceMark.validate();
  }
}

async function save(assessmentResult, competenceMarks) {
  await _validatedDataForAllCompetenceMark(competenceMarks);
  const { id }  = await assessmentResultRepository.save(assessmentResult);
  return bluebird.mapSeries(competenceMarks,
    (competenceMark) => competenceMarkRepository.save(new CompetenceMark({ ...competenceMark, assessmentResultId: id }))
  );
}

module.exports = {
  save,
};

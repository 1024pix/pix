import assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository';
import competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository';
import CompetenceMark from '../models/CompetenceMark';
import bluebird from 'bluebird';

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

export default {
  save,
};

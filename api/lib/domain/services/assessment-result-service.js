import bluebird from 'bluebird';

import * as assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository.js';
import * as competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository.js';
import { CompetenceMark } from '../models/CompetenceMark.js';

async function _validatedDataForAllCompetenceMark(competenceMarks) {
  for (const competenceMark of competenceMarks) {
    competenceMark.validate();
  }
}

async function save({
  certificationCourseId,
  assessmentResult,
  competenceMarks,
  dependencies = {
    assessmentResultRepository,
    competenceMarkRepository,
  },
}) {
  await _validatedDataForAllCompetenceMark(competenceMarks);
  const { id: assessmentResultId } = await dependencies.assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });
  return bluebird.mapSeries(competenceMarks, (competenceMark) =>
    dependencies.competenceMarkRepository.save(new CompetenceMark({ ...competenceMark, assessmentResultId })),
  );
}

export { save };

/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').assessmentResultRepository} assessmentResultRepository
 * @typedef {import ('../../../shared/domain/usecases/index.js').competenceMarkRepository} competenceMarkRepository
 */

import bluebird from 'bluebird';
import { CompetenceMark } from '../../../../../lib/domain/models/index.js';

/**
 * @param {Object} params
 * @param {assessmentResultRepository} params.assessmentResultRepository
 * @param {competenceMarkRepository} params.competenceMarkRepository
 */

const updateJuryComments = async function ({
  certificationCourseId,
  assessmentResult,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const competenceMarks = await competenceMarkRepository.findByCertificationCourseId(certificationCourseId);

  const { id: assessmentResultId } = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  await bluebird.each(competenceMarks, (competenceMark) =>
    competenceMarkRepository.save(new CompetenceMark({ ...competenceMark, assessmentResultId })),
  );
};

export { updateJuryComments };

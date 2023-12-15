import bluebird from 'bluebird';
import { CompetenceMark } from '../models/index.js';

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

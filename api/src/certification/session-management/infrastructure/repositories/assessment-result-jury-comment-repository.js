import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AssessmentResultJuryComment } from '../../domain/models/AssessmentResultJuryComment.js';

const getLatestAssessmentResultJuryComment = async function ({ certificationCourseId }) {
  const result = await knex('assessment-results')
    .select('id', 'juryId', 'commentByJury')
    .innerJoin(
      'certification-courses-last-assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .where({ certificationCourseId })
    .first();

  if (!result) {
    throw new NotFoundError(`Assessment result not found for certification course ${certificationCourseId}`);
  }

  return new AssessmentResultJuryComment(result);
};

const update = async function ({ id, juryId, commentByJury }) {
  return knex('assessment-results').update({ juryId, commentByJury }).where({ id });
};

export { getLatestAssessmentResultJuryComment, update };

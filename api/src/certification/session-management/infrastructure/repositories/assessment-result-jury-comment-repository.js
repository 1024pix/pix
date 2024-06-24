import { knex } from '../../../../../db/knex-database-connection.js';
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

  return new AssessmentResultJuryComment(result);
};

export { getLatestAssessmentResult };

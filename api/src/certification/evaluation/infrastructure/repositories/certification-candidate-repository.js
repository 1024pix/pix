import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCandidateNotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCandidate } from '../../../../shared/domain/models/CertificationCandidate.js';

const findByAssessmentId = async function ({ assessmentId }) {
  const result = await knex('certification-candidates')
    .select('certification-candidates.*')
    .join('certification-courses', 'certification-courses.userId', 'certification-candidates.userId')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .where('assessments.id', assessmentId)
    .first();

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }

  return new CertificationCandidate(result);
};

export { findByAssessmentId };

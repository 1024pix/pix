import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCandidateNotFoundError } from '../../../../shared/domain/errors.js';
import { Candidate } from '../../../enrolment/domain/models/Candidate.js';

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

  return new Candidate(result);
};

export { findByAssessmentId };

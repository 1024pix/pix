import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCandidateNotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationCandidateForSupervising } from '../../domain/models/CertificationCandidateForSupervising.js';

const get = async function (certificationCandidateId) {
  const result = await knex('certification-candidates')
    .select(
      'certification-candidates.*',
      'assessments.state AS assessmentStatus',
      'certification-courses.createdAt AS startDateTime',
    )
    .leftJoin('certification-courses', function () {
      this.on('certification-courses.sessionId', '=', 'certification-candidates.sessionId');
      this.on('certification-courses.userId', '=', 'certification-candidates.userId');
    })
    .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .where({ 'certification-candidates.id': certificationCandidateId })
    .first();

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }

  return new CertificationCandidateForSupervising({ ...result });
};

const update = async function (certificationCandidateForSupervising) {
  const result = await knex('certification-candidates')
    .where({
      id: certificationCandidateForSupervising.id,
    })
    .update({ authorizedToStart: certificationCandidateForSupervising.authorizedToStart });

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }
};

export { get, update };

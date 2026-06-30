import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCandidateNotFoundError } from '../../../shared/domain/errors.js';
import { CertificationCandidateForSupervising } from '../../domain/models/CertificationCandidateForSupervising.js';

const get = async function ({ certificationCandidateId }) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('certification-candidates')
    .select(
      'certification-candidates.*',
      'assessments.state AS assessmentStatus',
      'certification-courses.createdAt AS startDateTime',
      'certification_versions.assessmentDuration AS assessmentDuration',
    )
    .leftJoin('certification-courses', 'certification-candidates.id', 'certification-courses.candidateId')
    .leftJoin('certification_versions', 'certification_versions.id', 'certification-courses.versionId')
    .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .where({ 'certification-candidates.id': certificationCandidateId })
    .first();

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }

  return new CertificationCandidateForSupervising({ ...result });
};

const update = async function (certificationCandidateForSupervising) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('certification-candidates')
    .where({
      id: certificationCandidateForSupervising.id,
    })
    .update({ authorizedToStart: certificationCandidateForSupervising.authorizedToStart });

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }
};

export { get, update };

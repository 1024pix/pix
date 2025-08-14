import * as injectedOrganizationLearnerRepository from '../../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCertificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import { StudentForEnrolment } from '../read-models/StudentForEnrolment.js';

const findStudentsForEnrolment = async function ({
  certificationCenterId,
  sessionId,
  page,
  filter,
  organizationRepository = injectedOrganizationRepository,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  certificationCandidateRepository = injectedCertificationCandidateRepository,
} = {}) {
  try {
    const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
    const paginatedStudents = await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
      page,
      filter,
      organizationId,
    });
    const certificationCandidates = await certificationCandidateRepository.findBySessionId(sessionId);
    return {
      data: _buildStudentsForEnrolment({ students: paginatedStudents.data, certificationCandidates }),
      pagination: paginatedStudents.pagination,
    };
  } catch (error) {
    // This should not happen but still might (due to missing data in database)
    // in that case, handle error gracefully.
    // The error will be handled properly in the future.
    if (error instanceof NotFoundError) return _emptyResponse(page);

    throw error;
  }
};

export { findStudentsForEnrolment };

function _buildStudentsForEnrolment({ students, certificationCandidates }) {
  return students.map((student) =>
    StudentForEnrolment.fromStudentsAndCertificationCandidates({ student, certificationCandidates }),
  );
}

function _emptyResponse(page) {
  return {
    data: [],
    pagination: { page: page.number, pageSize: page.size, rowCount: 0, pageCount: 0 },
  };
}

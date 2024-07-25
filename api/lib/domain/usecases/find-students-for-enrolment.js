import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { StudentForEnrolment } from '../../../src/shared/domain/read-models/StudentForEnrolment.js';

const findStudentsForEnrolment = async function ({
  certificationCenterId,
  sessionId,
  page,
  filter,
  organizationRepository,
  organizationLearnerRepository,
  certificationCandidateRepository,
}) {
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

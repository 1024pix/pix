import { StudentForEnrolment } from '../read-models/StudentForEnrolment.js';

const findStudentsForEnrolment = async function ({
  certificationCenterId,
  sessionId,
  page,
  filter,
  centerRepository,
  organizationLearnerRepository,
  candidateRepository,
}) {
  const organizationId = await centerRepository.findActiveScoOrganizationId({ certificationCenterId });

  if (!organizationId) {
    return _emptyResponse(page);
  }

  const paginatedStudents = await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
    page,
    filter,
    organizationId,
  });
  const candidates = await candidateRepository.findBySessionId({ sessionId });
  return {
    data: _buildStudentsForEnrolment({ students: paginatedStudents.data, candidates }),
    pagination: paginatedStudents.pagination,
  };
};

export { findStudentsForEnrolment };

function _buildStudentsForEnrolment({ students, candidates }) {
  return students.map((student) => StudentForEnrolment.fromStudentsAndCandidates({ student, candidates }));
}

function _emptyResponse(page) {
  return {
    data: [],
    pagination: { page: page.number, pageSize: page.size, rowCount: 0, pageCount: 0 },
  };
}

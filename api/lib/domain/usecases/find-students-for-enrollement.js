const { NotFoundError } = require('../errors');
const StudentForEnrollement = require('../read-models/StudentForEnrollement');

module.exports = async function findStudentsForEnrollement({
  certificationCenterId,
  sessionId,
  page,
  organizationRepository,
  schoolingRegistrationRepository,
  certificationCandidateRepository,
}) {
  try {
    const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
    const paginatedStudents = await schoolingRegistrationRepository.findByOrganizationIdOrderByDivision({ page, organizationId });
    const certificationCandidates = await certificationCandidateRepository.findBySessionId(sessionId);
    return {
      data: _buildStudentsForEnrollement({ students: paginatedStudents.data, certificationCandidates }),
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

function _buildStudentsForEnrollement({ students, certificationCandidates }) {
  return students.map((student) =>
    StudentForEnrollement.fromStudentsAndCertificationCandidates({ student, certificationCandidates }),
  );
}

function _emptyResponse(page) {
  return {
    data: [],
    pagination: { page: page.number, pageSize: page.size, rowCount: 0, pageCount: 0 },
  };
}

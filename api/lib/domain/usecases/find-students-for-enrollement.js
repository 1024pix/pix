const { NotFoundError } = require('../errors');
const StudentForEnrollement = require('../read-models/StudentForEnrollement');

module.exports = async function findStudentsForEnrollement({
  certificationCenterId,
  sessionId,
  organizationRepository,
  schoolingRegistrationRepository,
  certificationCandidateRepository,
}) {
  try {
    const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
    const students = await schoolingRegistrationRepository.findByOrganizationIdOrderByDivision({ organizationId });
    const certificationCandidates = await certificationCandidateRepository.findBySessionId(sessionId);
    return _buildStudentsForEnrollement({ students, certificationCandidates });
  } catch (error) {
    if (error instanceof NotFoundError) return [];
    throw error;
  }
};

function _buildStudentsForEnrollement({ students, certificationCandidates }) {
  return students.map((student) =>
    StudentForEnrollement.fromStudentsAndCertificationCandidates({ student, certificationCandidates }),
  );
}

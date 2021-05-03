const SCOCertificationCandidate = require('../models/SCOCertificationCandidate');
const _ = require('lodash');
const { ForbiddenAccess } = require('../errors');

module.exports = async function enrollStudentsToSession({
  sessionId,
  referentId,
  studentIds,
  scoCertificationCandidateRepository,
  schoolingRegistrationRepository,
  organizationRepository,
  certificationCenterMembershipRepository,
  sessionRepository,
} = {}) {
  const session = await sessionRepository.get(sessionId);
  const referentCertificationCenterMemberships = await certificationCenterMembershipRepository.findByUserId(referentId);

  if (!_doesSessionBelongToSameCertificationCenterAsReferent(referentCertificationCenterMemberships, session)) {
    throw new ForbiddenAccess('Impossible de modifier une session ne faisant pas partie de votre établissement');
  }

  const students = await schoolingRegistrationRepository.findByIds({ ids: studentIds });

  const doAllStudentsBelongToSameCertificationCenterAsSession = await _doAllStudentsBelongToSameCertificationCenterAsSession({ students, session, organizationRepository });
  if (!doAllStudentsBelongToSameCertificationCenterAsSession) {
    throw new ForbiddenAccess('Impossible d\'inscrire un élève ne faisant pas partie de votre établissement');
  }

  const scoCertificationCandidates = students.map((student) => {
    return new SCOCertificationCandidate({
      firstName: student.firstName.trim(),
      lastName: student.lastName.trim(),
      birthdate: student.birthdate,
      sessionId,
      schoolingRegistrationId: student.id,
    });
  });

  await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({ sessionId, scoCertificationCandidates });
};

function _doesSessionBelongToSameCertificationCenterAsReferent(referentCertificationCenterMemberships, session) {
  return referentCertificationCenterMemberships.some((membership) => membership.certificationCenter.id === session.certificationCenterId);
}

async function _doAllStudentsBelongToSameCertificationCenterAsSession({ students, session, organizationRepository }) {
  const certificationCenterId = session.certificationCenterId;
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);

  return _.every(students, (student) => organizationId === student.organizationId);
}

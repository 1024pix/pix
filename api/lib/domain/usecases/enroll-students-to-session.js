const SCOCertificationCandidate = require('../models/SCOCertificationCandidate');
const _ = require('lodash');
const { ForbiddenAccess } = require('../errors');

module.exports = async function enrollStudentsToSession({
  sessionId,
  referentId,
  studentIds,
  scoCertificationCandidateRepository,
  schoolingRegistrationRepository,
  membershipRepository,
  certificationCenterMembershipRepository,
  sessionRepository,
} = {}) {
  const session = await sessionRepository.get(sessionId);
  const referentCertificationCenterMemberships = await certificationCenterMembershipRepository.findByUserId(referentId);

  if (!_doesSessionBelongToSameCertificationCenterAsReferent(referentCertificationCenterMemberships, session)) {
    throw new ForbiddenAccess('Impossible de modifier une session ne faisant pas partie de votre établissement');
  }

  const referentOrganizationMemberships = await membershipRepository.findByUserId({ userId: referentId });
  const students = await schoolingRegistrationRepository.findByIds({ ids: studentIds });

  if (!_doAllStudentsBelongToSameOrganizationAsReferent(students, referentOrganizationMemberships)) {
    throw new ForbiddenAccess('Impossible d\'inscrire un élève ne faisant pas partie de votre établissement');
  }

  const scoCertificationCandidates = students.map((student) => {
    return new SCOCertificationCandidate({
      firstName: student.firstName,
      lastName: student.lastName,
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

function _doAllStudentsBelongToSameOrganizationAsReferent(students, referentOrganizationMemberships) {
  const membershipsOrganizationIds = referentOrganizationMemberships.map((m) => m.organization.id);
  return _.every(students, (student) => membershipsOrganizationIds.includes(student.organizationId));
}

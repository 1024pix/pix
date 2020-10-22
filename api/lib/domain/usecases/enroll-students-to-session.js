const CertificationCandidate = require('../models/CertificationCandidate');
const _ = require('lodash');
const { ForbiddenAccess } = require('../errors');

/*
 * le “student” est une association entre un schooling registration et
 * l’utilisateur qui a passé le plus de tests de certif.
 * Note : un étudiant IRL peut avoir plusieurs comptes Pix, et plusieurs
 * schooling registration. Le “student.js” dans le code n’a pas d’identité, ce
 * n’est pas une Entity.

 * La notion la plus utile d’étudiant serait un étudiant du point de vue d’un
 * établissement, ce qu’on a de plus proche c’est le schooling registration et pas
 * le “student.js”.

*/
module.exports = async function enrollStudentsToSession({
  sessionId,
  referentId,
  studentIds,
  certificationCandidateRepository,
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

  const certificationCandidates = students.map((student) => {
    return new CertificationCandidate({
      firstName: student.firstName,
      lastName: student.lastName,
      birthdate: student.birthdate,
      sessionId,
      schoolingRegistrationId: student.id,
    });
  });

  await certificationCandidateRepository.setSessionCandidates(
    sessionId,
    certificationCandidates,
  );
};

function _doesSessionBelongToSameCertificationCenterAsReferent(referentCertificationCenterMemberships, session) {
  return referentCertificationCenterMemberships.some((membership) => membership.certificationCenter.id === session.certificationCenterId);
}

function _doAllStudentsBelongToSameOrganizationAsReferent(students, referentOrganizationMemberships) {
  const membershipsOrganizationIds = referentOrganizationMemberships.map((m) => m.organization.id);
  return _.every(students, (student) => membershipsOrganizationIds.includes(student.organizationId));
}

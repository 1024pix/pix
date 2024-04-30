import _ from 'lodash';

import { ForbiddenAccess } from '../../../src/shared/domain/errors.js';
import { UnknownCountryForStudentEnrolmentError } from '../errors.js';
import { SCOCertificationCandidate } from '../models/SCOCertificationCandidate.js';
const INSEE_PREFIX_CODE = '99';

const enrolStudentsToSession = async function ({
  sessionId,
  referentId,
  studentIds,
  scoCertificationCandidateRepository,
  organizationLearnerRepository,
  organizationRepository,
  certificationCenterMembershipRepository,
  countryRepository,
  sessionEnrolmentRepository,
} = {}) {
  const session = await sessionEnrolmentRepository.get({ id: sessionId });
  const referentCertificationCenterMemberships = await certificationCenterMembershipRepository.findByUserId(referentId);

  if (!_doesSessionBelongToSameCertificationCenterAsReferent(referentCertificationCenterMemberships, session)) {
    throw new ForbiddenAccess('Impossible de modifier une session ne faisant pas partie de votre établissement');
  }

  const students = await organizationLearnerRepository.findByIds({ ids: studentIds });

  const doAllStudentsBelongToSameCertificationCenterAsSession =
    await _doAllStudentsBelongToSameCertificationCenterAsSession({ students, session, organizationRepository });
  if (!doAllStudentsBelongToSameCertificationCenterAsSession) {
    throw new ForbiddenAccess("Impossible d'inscrire un élève ne faisant pas partie de votre établissement");
  }

  const countries = await countryRepository.findAll();

  const scoCertificationCandidates = students.map((student) => {
    const studentInseeCountryCode = INSEE_PREFIX_CODE + student.birthCountryCode;

    const studentCountry = countries.find((country) => country.code === studentInseeCountryCode);

    if (!studentCountry)
      throw new UnknownCountryForStudentEnrolmentError({
        firstName: student.firstName.trim(),
        lastName: student.lastName.trim(),
      });

    return new SCOCertificationCandidate({
      firstName: student.firstName.trim(),
      lastName: student.lastName.trim(),
      birthdate: student.birthdate,
      birthINSEECode: student.birthCityCode,
      birthCountry: studentCountry.name,
      birthCity: student.birthCity,
      sex: student.sex,
      sessionId,
      organizationLearnerId: student.id,
    });
  });

  await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
    sessionId,
    scoCertificationCandidates,
  });
};

export { enrolStudentsToSession };

function _doesSessionBelongToSameCertificationCenterAsReferent(referentCertificationCenterMemberships, session) {
  return referentCertificationCenterMemberships.some(
    (membership) => membership.certificationCenter.id === session.certificationCenterId,
  );
}

async function _doAllStudentsBelongToSameCertificationCenterAsSession({ students, session, organizationRepository }) {
  const certificationCenterId = session.certificationCenterId;
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);

  return _.every(students, (student) => organizationId === student.organizationId);
}

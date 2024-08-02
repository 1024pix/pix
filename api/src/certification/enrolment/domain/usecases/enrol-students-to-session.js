/**
 * @typedef {import('./index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {import('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {import('./index.js').OrganizationRepository} OrganizationRepository
 * @typedef {import('./index.js').CertificationCenterMembershipRepository} CertificationCenterMembershipRepository
 * @typedef {import('./index.js').CountryRepository} CountryRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('../models/SCOCertificationCandidate.js').SCOCertificationCandidate} SCOCertificationCandidate
 */
import _ from 'lodash';

import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import { UnknownCountryForStudentEnrolmentError } from '../errors.js';
import { SCOCertificationCandidate } from '../models/SCOCertificationCandidate.js';
const INSEE_PREFIX_CODE = '99';

/**
 * @param {Object} params
 * @param {ScoCertificationCandidateRepository} params.scoCertificationCandidateRepository
 * @param {OrganizationLearnerRepository} params.organizationLearnerRepository
 * @param {OrganizationRepository} params.organizationRepository
 * @param {CertificationCenterMembershipRepository} params.certificationCenterMembershipRepository
 * @param {CountryRepository} params.countryRepository
 * @param {SessionRepository} params.sessionRepository
 */
const enrolStudentsToSession = async function ({
  sessionId,
  referentId,
  studentIds,
  scoCertificationCandidateRepository,
  organizationLearnerRepository,
  organizationRepository,
  certificationCenterMembershipRepository,
  countryRepository,
  sessionRepository,
} = {}) {
  const session = await sessionRepository.get({ id: sessionId });
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

    // TODO MVP - NEXT STEP - on pourrait peut etre éditer ce modèle pour qu'il ait
    // en permanence une CORE subscription...
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

  // TODO MVP - NEXT STEP - ... et sauvegarder la subscription là-dedans en faisant un refacto
  // pour utiliser la subscription
  // Je vois que c'est dans le répo que c'est fait le fait de save une Subscription "CORE"
  // mais ça me semble être une règle métier dont la place n'est pas dans un répo
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

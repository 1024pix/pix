/**
 * @typedef {import('./index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {import('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {import('./index.js').OrganizationRepository} OrganizationRepository
 * @typedef {import('./index.js').CountryRepository} CountryRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('../models/SCOCertificationCandidate.js').SCOCertificationCandidate} SCOCertificationCandidate
 */
import _ from 'lodash';

import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import { UnknownCountryForStudentEnrolmentError } from '../errors.js';
import { SCOCertificationCandidate } from '../models/SCOCertificationCandidate.js';
import { Subscription } from '../models/Subscription.js';
const INSEE_PREFIX_CODE = '99';

/**
 * @param {Object} params
 * @param {ScoCertificationCandidateRepository} params.scoCertificationCandidateRepository
 * @param {OrganizationLearnerRepository} params.organizationLearnerRepository
 * @param {OrganizationRepository} params.organizationRepository
 * @param {CountryRepository} params.countryRepository
 * @param {SessionRepository} params.sessionRepository
 */
const enrolStudentsToSession = async function ({
  sessionId,
  studentIds,
  scoCertificationCandidateRepository,
  organizationLearnerRepository,
  organizationRepository,
  countryRepository,
  sessionRepository,
} = {}) {
  const session = await sessionRepository.get({ id: sessionId });

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
      subscriptions: [Subscription.buildCore({ certificationCandidateId: null })],
    });
  });

  await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
    sessionId,
    scoCertificationCandidates,
  });
};

export { enrolStudentsToSession };

async function _doAllStudentsBelongToSameCertificationCenterAsSession({ students, session, organizationRepository }) {
  const certificationCenterId = session.certificationCenterId;
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);

  return _.every(students, (student) => organizationId === student.organizationId);
}

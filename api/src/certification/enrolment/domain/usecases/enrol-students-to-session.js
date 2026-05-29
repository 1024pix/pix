/**
 * @typedef {import('./index.js').ScoCertificationCandidateRepository} ScoCertificationCandidateRepository
 * @typedef {import('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 * @typedef {import('./index.js').CountryRepository} CountryRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('../models/SCOCertificationCandidate.js').SCOCertificationCandidate} SCOCertificationCandidate
 */
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { UnknownCountryForStudentEnrolmentError } from '../errors.js';
import { SCOCertificationCandidate } from '../models/SCOCertificationCandidate.js';

const INSEE_PREFIX_CODE = '99';

/**
 * @param {object} params
 * @param {ScoCertificationCandidateRepository} params.scoCertificationCandidateRepository
 * @param {OrganizationLearnerRepository} params.organizationLearnerRepository
 * @param {CenterRepository} params.centerRepository
 * @param {CountryRepository} params.countryRepository
 * @param {SessionRepository} params.sessionRepository
 */
const enrolStudentsToSession = async function ({
  sessionId,
  studentIds,
  scoCertificationCandidateRepository,
  organizationLearnerRepository,
  centerRepository,
  countryRepository,
  sessionRepository,
  certificationCpfCityRepository,
  certificationCpfCountryRepository,
  certificationCpfService,
  eventApi,
} = {}) {
  const session = await sessionRepository.get({ id: sessionId });
  const center = await centerRepository.getById({ id: session.certificationCenterId });

  const students = await organizationLearnerRepository.findByIds({ ids: studentIds });

  const doAllStudentsBelongToSameCertificationCenterAsSession =
    await _doAllStudentsBelongToSameCertificationCenterAsSession({ students, center });
  if (!doAllStudentsBelongToSameCertificationCenterAsSession) {
    throw new ForbiddenAccess("Impossible d'inscrire un élève ne faisant pas partie de votre établissement");
  }

  const countries = await countryRepository.findAll();

  const scoCertificationCandidates = await PromiseUtils.mapSeries(students, async (student) => {
    const studentInseeCountryCode = INSEE_PREFIX_CODE + student.birthCountryCode;
    const studentCountry = countries.find((country) => country.code === studentInseeCountryCode);

    if (!studentCountry) {
      throw new UnknownCountryForStudentEnrolmentError({
        firstName: student.firstName.trim(),
        lastName: student.lastName.trim(),
      });
    }

    let birthCity = student.birthCity;

    if (!student.birthCity && student.birthCityCode) {
      const birthInformation = await certificationCpfService.getBirthInformation({
        birthCountry: studentCountry.name,
        birthINSEECode: student.birthCityCode,
        birthCity: null,
        birthPostalCode: null,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

      birthCity = birthInformation.birthCity;
    }

    return new SCOCertificationCandidate({
      firstName: student.firstName.trim(),
      lastName: student.lastName.trim(),
      birthdate: student.birthdate,
      birthINSEECode: student.birthCityCode,
      birthCity: birthCity,
      birthCountry: studentCountry.name,
      sex: student.sex,
      sessionId,
      organizationLearnerId: student.id,
    });
  });

  const savedScoCandidates = await scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession({
    sessionId,
    scoCertificationCandidates,
  });
  await eventApi.pushMultipleCandidatesEnrolledEvent(
    savedScoCandidates.map((savedCandidate) => savedCandidate.toDTO()),
  );
};

export { enrolStudentsToSession };

async function _doAllStudentsBelongToSameCertificationCenterAsSession({ students, center }) {
  return students.every((student) => center.matchingOrganizationId === student.organizationId);
}

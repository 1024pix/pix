/**
 * @typedef {import('./index.js').OrganizationLearnerRepository} OrganizationLearnerRepository
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').CountryRepository} CountryRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').EventAdapter} EventAdapter
 */
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { SUBSCRIPTION_TYPES } from '../../../shared/domain/constants.js';
import { CannotEnrollScoCandidateError, UnknownCountryForStudentEnrolmentError } from '../errors.js';
import { Candidate } from '../models/Candidate.js';

const INSEE_PREFIX_CODE = '99';

/**
 * @param {object} params
 * @param {OrganizationLearnerRepository} params.organizationLearnerRepository
 * @param {CandidateRepository} params.candidateRepository
 * @param {CountryRepository} params.countryRepository
 * @param {EventAdapter} params.eventAdapter
 * @param {SessionAuthorizationAdapter} params.sessionAuthorizationAdapter
 */
export async function enrolStudentsToSession({
  sessionId,
  studentIds,
  organizationLearnerRepository,
  countryRepository,
  candidateRepository,
  certificationCpfCityRepository,
  certificationCpfCountryRepository,
  certificationCpfService,
  eventAdapter,
  sessionAuthorizationAdapter,
}) {
  if (studentIds.length === 0) {
    return;
  }
  const sessionAuthorization = await sessionAuthorizationAdapter.find({ sessionId });
  if (!sessionAuthorization.canEnrollScoCandidate) {
    throw new CannotEnrollScoCandidateError();
  }
  const enrolledCandidates = await candidateRepository.findBySessionId({ sessionId });
  const alreadyEnrolledStudentIds = enrolledCandidates.map((candidate) => candidate.organizationLearnerId);
  const studentIdsNotYetEnrolled = studentIds.filter((studentId) => !alreadyEnrolledStudentIds.includes(studentId));
  const students = await organizationLearnerRepository.findByIds({ ids: studentIdsNotYetEnrolled });

  const doStudentsBelongToCenter = students.every(
    (student) => sessionAuthorization.scoIsManagingStudentsOrganizationId === student.organizationId,
  );
  if (!doStudentsBelongToCenter) {
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

    return new Candidate({
      firstName: student.firstName.trim(),
      lastName: student.lastName.trim(),
      birthdate: student.birthdate,
      birthINSEECode: student.birthCityCode,
      birthCity: birthCity,
      birthCountry: studentCountry.name,
      sex: student.sex,
      sessionId,
      organizationLearnerId: student.id,
      subscription: SUBSCRIPTION_TYPES.CORE,
    });
  });

  const savedCandidates = await candidateRepository.save({ candidates: scoCertificationCandidates });
  await eventAdapter.onCandidatesEnrolledSco({ candidates: savedCandidates });
}

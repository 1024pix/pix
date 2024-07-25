import { CertificationCandidatesError } from '../../../../../src/shared/domain/errors.js';
/**
 * @typedef {import('../../domain/usecases/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../domain/usecases/index.js').CertificationCpfService} CertificationCpfService
 * @typedef {import('../../domain/usecases/index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../domain/usecases/index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 */

/**
 * @param {Object} params
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCpfService} params.certificationCpfService
 * @param {CertificationCpfCountryRepository} params.certificationCpfCountryRepository
 * @param {CertificationCpfCityRepository} params.certificationCpfCityRepository
 **/
const correctCandidateIdentityInCertificationCourse = async function ({
  command: {
    certificationCourseId,
    firstName,
    lastName,
    birthdate,
    birthplace,
    sex,
    birthCountry,
    birthPostalCode,
    birthINSEECode,
  },

  certificationCourseRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.correctFirstName(firstName);
  certificationCourse.correctLastName(lastName);
  certificationCourse.correctBirthdate(birthdate);
  certificationCourse.correctBirthplace(birthplace);
  certificationCourse.correctSex(sex);

  const cpfBirthInformation = await certificationCpfService.getBirthInformation({
    birthCountry,
    birthCity: birthplace,
    birthPostalCode,
    birthINSEECode,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
  });

  if (cpfBirthInformation.hasFailed()) {
    throw new CertificationCandidatesError({ message: cpfBirthInformation.firstErrorMessage });
  }

  certificationCourse.correctBirthInformation(cpfBirthInformation);

  await certificationCourseRepository.update({ certificationCourse });
};

export { correctCandidateIdentityInCertificationCourse };

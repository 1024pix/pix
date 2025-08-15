import { CertificationCandidatesError } from '../../../../../src/shared/domain/errors.js';
import * as injectedCertificationCpfCityRepository from '../../../enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import * as injectedCertificationCpfCountryRepository from '../../../enrolment/infrastructure/repositories/certification-cpf-country-repository.js';
import * as injectedCertificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
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

  certificationCourseRepository = injectedCertificationCourseRepository,
  certificationCpfService = injectedCertificationCpfService,
  certificationCpfCountryRepository = injectedCertificationCpfCountryRepository,
  certificationCpfCityRepository = injectedCertificationCpfCityRepository,
} = {}) {
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

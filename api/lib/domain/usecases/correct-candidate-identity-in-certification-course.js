import { CertificationCandidatesError } from '../../../src/shared/domain/errors.js';

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

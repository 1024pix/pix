const { CpfBirthInformationValidationError } = require('../errors.js');

module.exports = async function correctCandidateIdentityInCertificationCourse({
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
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
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
    throw new CpfBirthInformationValidationError(cpfBirthInformation.message);
  }

  certificationCourse.correctBirthInformation(cpfBirthInformation);

  await certificationCourseRepository.update(certificationCourse);
};

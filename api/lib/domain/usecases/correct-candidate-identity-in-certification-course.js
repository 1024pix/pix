module.exports = async function correctCandidateIdentityInCertificationCourse({
  command: {
    certificationCourseId,
    firstName,
    lastName,
    birthdate,
    birthplace,
    sex,
  },
  certificationCourseRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.correctFirstName(firstName);
  certificationCourse.correctLastName(lastName);
  certificationCourse.correctBirthdate(birthdate);
  certificationCourse.correctBirthplace(birthplace);
  certificationCourse.correctSex(sex);

  await certificationCourseRepository.update(certificationCourse);
};

module.exports = async function correctCandidateIdentityInCertificationCourse({
  command: {
    certificationCourseId,
    firstName,
    lastName,
    birthdate,
    birthplace,
  },
  certificationCourseRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.correctFirstName(firstName);
  certificationCourse.correctLastName(lastName);
  certificationCourse.correctBirthplace(birthplace);
  certificationCourse.correctBirthdate(birthdate);
  await certificationCourseRepository.update(certificationCourse);
};

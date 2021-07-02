module.exports = async function modifyCandidateInCertificationCourse({
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
  certificationCourse.modifyFirstName(firstName);
  certificationCourse.modifyLastName(lastName);
  certificationCourse.modifyBirthplace(birthplace);
  certificationCourse.modifyBirthdate(birthdate);
  await certificationCourseRepository.save({ certificationCourse });
};

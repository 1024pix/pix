module.exports = async function modifyCandidateInCertificationCourse({
  certificationCourseRepository,
  candidateModificationCommand,
}) {
  const {
    certificationCourseId,
    firstName,
    lastName,
    birthdate,
    birthplace,
  } = candidateModificationCommand;
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.modifyFirstName(firstName);
  certificationCourse.modifyLastName(lastName);
  certificationCourse.modifyBirthplace(birthplace);
  certificationCourse.modifyBirthdate(birthdate);
  await certificationCourseRepository.save({ certificationCourse });
};

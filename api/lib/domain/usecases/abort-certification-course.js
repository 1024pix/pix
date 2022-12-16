module.exports = async function abortCertificationCourse({
  certificationCourseRepository,
  certificationCourseId,
  abortReason,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.abort(abortReason);
  await certificationCourseRepository.update(certificationCourse);
};

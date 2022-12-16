module.exports = async function uncancelCertificationCourse({ certificationCourseId, certificationCourseRepository }) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.uncancel();
  await certificationCourseRepository.update(certificationCourse);
};

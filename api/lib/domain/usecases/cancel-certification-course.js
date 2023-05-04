const cancelCertificationCourse = async function ({ certificationCourseId, certificationCourseRepository }) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.cancel();
  await certificationCourseRepository.update(certificationCourse);
};

export { cancelCertificationCourse };

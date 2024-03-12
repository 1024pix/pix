const cancelCertificationCourse = async function ({ certificationCourseId, certificationCourseRepository }) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.cancel();
  await certificationCourseRepository.update({ certificationCourse });
};

export { cancelCertificationCourse };

const uncancelCertificationCourse = async function ({ certificationCourseId, certificationCourseRepository }) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.uncancel();
  await certificationCourseRepository.update({ certificationCourse });
};

export { uncancelCertificationCourse };

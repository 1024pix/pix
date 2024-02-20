const abortCertificationCourse = async function ({
  certificationCourseRepository,
  certificationCourseId,
  abortReason,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.abort(abortReason);
  await certificationCourseRepository.update(certificationCourse);
};

export { abortCertificationCourse };

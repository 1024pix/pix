const abortCertificationCourse = async function ({
  certificationCourseRepository,
  certificationCourseId,
  abortReason,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.abort(abortReason);
  await certificationCourseRepository.update({ certificationCourse });
};

export { abortCertificationCourse };

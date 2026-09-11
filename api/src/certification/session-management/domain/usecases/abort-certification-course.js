export async function abortCertificationCourse({ certificationCourseRepository, certificationCourseId, abortReason }) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  certificationCourse.abort(abortReason);
  await certificationCourseRepository.update({ certificationCourse });
}

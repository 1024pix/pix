export default async function cancelCertificationCourse({ certificationCourseId, certificationCourseRepository }) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  certificationCourse.cancel();
  await certificationCourseRepository.update(certificationCourse);
}

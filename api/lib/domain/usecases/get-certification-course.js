export default async function getCertificationCourse({ certificationCourseId, certificationCourseRepository }) {
  return certificationCourseRepository.get(certificationCourseId);
}

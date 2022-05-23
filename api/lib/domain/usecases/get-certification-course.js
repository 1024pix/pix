module.exports = async function getCertificationCourse({ certificationCourseId, certificationCourseRepository }) {
  return certificationCourseRepository.get(certificationCourseId);
};

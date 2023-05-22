const getCertificationCourse = async function ({ certificationCourseId, certificationCourseRepository }) {
  return certificationCourseRepository.get(certificationCourseId);
};

export { getCertificationCourse };

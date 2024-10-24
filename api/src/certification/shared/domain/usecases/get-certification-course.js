const getCertificationCourse = async function ({ certificationCourseId, certificationCourseRepository }) {
  return certificationCourseRepository.get({ id: certificationCourseId });
};

export { getCertificationCourse };

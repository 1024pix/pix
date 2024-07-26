const getJuryCertification = async function ({ certificationCourseId, juryCertificationRepository }) {
  return juryCertificationRepository.get(certificationCourseId);
};

export { getJuryCertification };

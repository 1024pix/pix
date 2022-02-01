module.exports = async function getJuryCertification({ certificationCourseId, juryCertificationRepository }) {
  return juryCertificationRepository.get(certificationCourseId);
};

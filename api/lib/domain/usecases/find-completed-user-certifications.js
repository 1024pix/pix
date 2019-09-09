module.exports = function findCompletedUserCertifications({ userId, certificationRepository }) {
  return certificationRepository.findByUserId(userId);
};

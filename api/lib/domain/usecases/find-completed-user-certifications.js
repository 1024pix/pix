module.exports = function({ userId, certificationRepository }) {
  return certificationRepository.findCompletedCertificationsByUserId(userId);
};

module.exports = function({ userId, certificationRepository }) {
  return certificationRepository.findByUserId(userId);
};

module.exports = function getPrescriber({ userId, prescriberRepository }) {
  return prescriberRepository.getPrescriber(userId);
};

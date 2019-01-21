module.exports = function findSnapshots({ userId, certificationCenterId, sessionRepository }) {
  return sessionRepository.findByCertificationCenter(certificationCenterId);
};

module.exports = function findCertificationCenters({ id, certificationCenterRepository }) {
  return certificationCenterRepository.get(id);
};

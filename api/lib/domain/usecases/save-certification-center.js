module.exports = function findCertificationCenters({ certificationCenter, certificationCenterRepository }) {
  return certificationCenterRepository.save(certificationCenter);
};

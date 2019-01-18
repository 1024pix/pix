module.exports = function saveCertificationCenters({ certificationCenter, certificationCenterRepository }) {
  return certificationCenterRepository.save(certificationCenter);
};

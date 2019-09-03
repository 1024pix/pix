module.exports = function saveCertificationCenter({ certificationCenter, certificationCenterRepository }) {
  return certificationCenterRepository.save(certificationCenter);
};

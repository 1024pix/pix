module.exports = function getCertificationCenter({ id, certificationCenterRepository }) {
  return certificationCenterRepository.get(id);
};

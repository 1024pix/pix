module.exports = function getCertificationCenter({ id, certificationCenterForAdminRepository }) {
  return certificationCenterForAdminRepository.get(id);
};

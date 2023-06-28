const getCertificationCenterForAdmin = function ({ id, certificationCenterForAdminRepository }) {
  return certificationCenterForAdminRepository.get(id);
};

export { getCertificationCenterForAdmin };

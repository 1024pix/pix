const getCertificationCenter = function ({ id, certificationCenterRepository }) {
  return certificationCenterRepository.get(id);
};

export { getCertificationCenter };

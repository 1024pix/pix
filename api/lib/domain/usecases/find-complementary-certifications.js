const findComplementaryCertifications = function ({ complementaryCertificationRepository }) {
  return complementaryCertificationRepository.findAll();
};

export { findComplementaryCertifications };

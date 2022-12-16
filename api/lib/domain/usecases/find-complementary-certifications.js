module.exports = function findComplementaryCertifications({ complementaryCertificationRepository }) {
  return complementaryCertificationRepository.findAll();
};

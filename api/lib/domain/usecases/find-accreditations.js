module.exports = function findAccreditations({ complementaryCertificationRepository }) {
  return complementaryCertificationRepository.findAll();
};

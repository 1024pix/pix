module.exports = function findAccreditations({ accreditationRepository }) {
  return accreditationRepository.findAll();
};

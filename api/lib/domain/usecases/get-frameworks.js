module.exports = async function getFrameworks({ frameworkRepository }) {
  return frameworkRepository.list();
};

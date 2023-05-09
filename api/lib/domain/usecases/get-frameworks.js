const getFrameworks = async function ({ frameworkRepository }) {
  return frameworkRepository.list();
};

export { getFrameworks };

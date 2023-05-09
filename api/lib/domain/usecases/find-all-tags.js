const findAllTags = function ({ tagRepository }) {
  return tagRepository.findAll();
};

export { findAllTags };

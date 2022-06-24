module.exports = function findAllTags({ tagRepository }) {
  return tagRepository.findAll();
};

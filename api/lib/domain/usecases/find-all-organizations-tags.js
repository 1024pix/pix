module.exports = async function findAllOrganizationsTags({
  tagRepository,
}) {
  return tagRepository.findAll();
};

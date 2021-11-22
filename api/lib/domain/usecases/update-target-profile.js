module.exports = async function updateTargetProfile({ id, name, description, comment, targetProfileRepository }) {
  await targetProfileRepository.update({ id, name, description, comment });
};

module.exports = async function updateTargetProfile({ id, name, description, targetProfileRepository }) {
  await targetProfileRepository.update({ id, name, description });
};

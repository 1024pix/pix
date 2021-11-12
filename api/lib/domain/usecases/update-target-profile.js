module.exports = async function updateTargetProfile({ id, name, targetProfileRepository }) {
  await targetProfileRepository.update({ id, name });
};

module.exports = async function updateTargetProfileName({
  id,
  name,
  targetProfileRepository,
}) {
  await targetProfileRepository.updateName({ id, name });
};

module.exports = async function updateTargetProfileName({
  id,
  name,
  targetProfileRepository,
}) {
  await targetProfileRepository.update({ id, name });
};

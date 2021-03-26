module.exports = async function outdateTargetProfile({
  id,
  targetProfileRepository,
}) {
  await targetProfileRepository.update({ id, outdated: true });
};

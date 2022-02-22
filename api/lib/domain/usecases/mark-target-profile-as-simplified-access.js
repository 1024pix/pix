module.exports = async function markTargetProfileAsSimplifiedAccess({ id, targetProfileRepository }) {
  await targetProfileRepository.update({ id, isSimplifiedAccess: true });
};

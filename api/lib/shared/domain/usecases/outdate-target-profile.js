const outdateTargetProfile = async function ({ id, targetProfileRepository }) {
  await targetProfileRepository.update({ id, outdated: true });
};

export { outdateTargetProfile };

const outdateTargetProfile = async function ({ id, targetProfileAdministrationRepository }) {
  await targetProfileAdministrationRepository.update({ id, outdated: true });
};

export { outdateTargetProfile };

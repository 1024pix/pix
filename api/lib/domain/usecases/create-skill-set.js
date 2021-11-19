module.exports = async function createSkillSet({ badgeId, skillSet, skillSetRepository }) {
  await skillSetRepository.save({
    skillSet: {
      ...skillSet,
      badgeId,
    },
  });
};

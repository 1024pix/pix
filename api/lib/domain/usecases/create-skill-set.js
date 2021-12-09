module.exports = function createSkillSet({ badgeId, skillSet, skillSetRepository }) {
  return skillSetRepository.save({
    skillSet: {
      ...skillSet,
      badgeId,
    },
  });
};

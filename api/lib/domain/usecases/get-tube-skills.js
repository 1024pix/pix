module.exports = async function getTubeSkills({ skillRepository, tubeId }) {
  return skillRepository.findActiveByTubeId(tubeId);
};

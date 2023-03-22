function getCappedSkills({ skills, cappedLevel }) {
  return skills.filter((skill) => skill.difficulty <= cappedLevel);
}

module.exports = {
  getCappedSkills,
};

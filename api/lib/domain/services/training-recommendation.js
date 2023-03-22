function getCappedSkills({ skills, cappedLevel }) {
  return skills.filter((skill) => skill.difficulty <= cappedLevel);
}

function getCappedKnowledgeElements({ knowledgeElements, cappedSkills }) {
  const skillIds = cappedSkills.map((skill) => skill.id);
  return knowledgeElements.filter((knowledgeElement) => skillIds.includes(knowledgeElement.skillId));
}

module.exports = {
  getCappedSkills,
  getCappedKnowledgeElements,
};

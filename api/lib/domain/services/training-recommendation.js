function getCappedSkills({ skills, cappedLevel }) {
  return skills.filter((skill) => skill.difficulty <= cappedLevel);
}

function getCappedKnowledgeElements({ knowledgeElements, cappedSkills }) {
  const skillIds = cappedSkills.map((skill) => skill.id);
  return knowledgeElements.filter((knowledgeElement) => skillIds.includes(knowledgeElement.skillId));
}

function getValidatedKnowledgeElementsCount({ knowledgeElements }) {
  return knowledgeElements.filter((knowledgeElement) => knowledgeElement.isValidated).length;
}

module.exports = {
  getCappedSkills,
  getCappedKnowledgeElements,
  getValidatedKnowledgeElementsCount,
};

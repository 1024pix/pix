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

function getValidatedKnowledgeElementsPercentage({ knowledgeElements }) {
  if (knowledgeElements.length === 0) return 0;

  const validatedKnowledgeElementsCount = getValidatedKnowledgeElementsCount({ knowledgeElements });
  return Math.round((validatedKnowledgeElementsCount / knowledgeElements.length) * 100);
}

module.exports = {
  getCappedSkills,
  getCappedKnowledgeElements,
  getValidatedKnowledgeElementsCount,
  getValidatedKnowledgeElementsPercentage,
};

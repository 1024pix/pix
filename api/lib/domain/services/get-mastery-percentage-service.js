/**
 * Returns mastery percentage based on user
 * knowledge elements and skillIds.
 *
 * @param {KnowledgeElement[]} knowledgeElements
 * @param {string[]} skillIds
 *
 * @returns {number}
 */
export const getMasteryPercentage = (knowledgeElements, skillIds) => {
  if (!skillIds.length) return 0;

  const validatedKnowledgeElements = knowledgeElements.filter(({ isValidated }) => isValidated);

  const knowledgeElementsInSkills = validatedKnowledgeElements.filter((knowledgeElement) =>
    skillIds.some((id) => String(id) === String(knowledgeElement.skillId)),
  );

  return Math.round((knowledgeElementsInSkills.length * 100) / skillIds.length);
};

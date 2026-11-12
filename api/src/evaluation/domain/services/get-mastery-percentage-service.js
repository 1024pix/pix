/**
 * Returns mastery percentage based on user
 * knowledge elements and skillIds.
 *
 * @param {KnowledgeElement[]} knowledgeElements
 * @param {string[]} skillIds
 * @param {boolean} round
 *
 * @returns {number}
 */
export const getMasteryPercentage = (knowledgeElements, skillIds, round = true) => {
  if (!skillIds.length) return 0;

  const validatedKnowledgeElements = knowledgeElements.filter(({ isValidated }) => isValidated);

  const skillIdsAsStrings = new Set(skillIds.map(String));
  const knowledgeElementsInSkills = validatedKnowledgeElements.filter(({ skillId }) =>
    skillIdsAsStrings.has(String(skillId)),
  );

  if (round) {
    return Math.round((knowledgeElementsInSkills.length * 100) / skillIds.length);
  } else {
    return (knowledgeElementsInSkills.length * 100) / skillIds.length;
  }
};

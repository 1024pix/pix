/**
 * Taux de maîtrise : la part des acquis visés que l'état donne validés.
 *
 * @param {KnowledgeState} knowledgeState
 * @param {string[]} skillIds les acquis visés
 * @param {boolean} round
 *
 * @returns {number}
 */
export const getMasteryPercentage = (knowledgeState, skillIds, round = true) => {
  if (!skillIds.length) return 0;

  const wantedSkillIds = new Set(skillIds.map(String));
  const validatedCount = knowledgeState.validatedSkills().filter(({ id }) => wantedSkillIds.has(String(id))).length;

  if (round) {
    return Math.round((validatedCount * 100) / skillIds.length);
  } else {
    return (validatedCount * 100) / skillIds.length;
  }
};

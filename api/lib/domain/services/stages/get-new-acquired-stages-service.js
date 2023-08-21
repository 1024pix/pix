/**
 * Filter stages that should be acquired based on validatedSkillCount,
 * alreadyAcquiredStages and masteryPercentage.
 *
 * @param {Stage[]} stages
 * @param {number} validatedSkillCount
 * @param {number[]} alreadyAcquiredStagesIds
 * @param {number} masteryPercentage
 *
 * @returns {Stage[]}
 */
export const getNewAcquiredStages = (stages, validatedSkillCount, alreadyAcquiredStagesIds, masteryPercentage) =>
  stages.filter((stage) => {
    if (alreadyAcquiredStagesIds.includes(stage.id)) return false;
    if (stage.isZeroStage) return true;
    if (stage.isFirstSkill) return validatedSkillCount >= 1;

    return stage.threshold <= masteryPercentage;
  });

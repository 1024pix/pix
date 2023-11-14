/**
 * @param {Stage[]} stages
 * @param {Skill[]} skills
 *
 * @returns {void}
 */
export const convertLevelStagesIntoThresholds = (stages, skills) => {
  stages.forEach((stage) => {
    if (stage.isZeroStage || stage.isFirstSkill || !stage.isLevelStage) return;

    if (!skills.length) {
      stage.setThreshold(100);
    }

    const stageSkillsCount = skills.filter((skill) => skill.difficulty <= stage.level).length;
    stage.setThreshold(Math.round((stageSkillsCount / skills.length) * 100));
  });
};

import uniqBy from 'lodash/uniqBy.js';

export class Success {
  /**
   * @param {KnowledgeStateDTO} knowledgeState
   */
  constructor({ knowledgeState, campaignSkills = [], targetProfileSkills = [] }) {
    this.knowledgeState = knowledgeState;
    this.campaignSkills = campaignSkills;
    this.targetProfileSkills = targetProfileSkills;
  }

  get skills() {
    return uniqBy([...this.campaignSkills, ...this.targetProfileSkills], 'id');
  }

  /**
   *
   * @param {Array<string>} skillIds
   * @returns {number}
   */
  getMasteryPercentageForSkills(skillIds) {
    // genre de doublon avec api/src/prescription/campaign-participation/domain/models/CampaignParticipationResult.js:64
    const totalSkillsCount = skillIds?.length;
    if (!totalSkillsCount) {
      return 0;
    }
    const validatedSkillIds = new Set(this.knowledgeState.validatedSkillIds);
    const validatedSkillsCount = skillIds.filter((skillId) => validatedSkillIds.has(skillId)).length;
    return Math.round((validatedSkillsCount * 100) / totalSkillsCount);
  }

  /**
   *
   * @param {Array<{tubeId: string, level: number}>} cappedTubes
   * @returns {number}
   */
  getMasteryPercentageForCappedTubes(cappedTubes) {
    if (!Array.isArray(cappedTubes)) {
      return 0;
    }
    const uniqCampaignSkills = this.skills;
    let total = 0;
    let validated = 0;
    for (const cappedTube of cappedTubes) {
      const floor = this.knowledgeState.floorByTubeId[cappedTube.tubeId] ?? 0;
      const skillsInTubeWithinMaxDifficulty = uniqCampaignSkills.filter(
        ({ tubeId, difficulty }) => tubeId === cappedTube.tubeId && difficulty <= cappedTube.level,
      );
      const skillsByDifficulty = Object.groupBy(skillsInTubeWithinMaxDifficulty, ({ difficulty }) => difficulty);
      for (const [difficulty] of Object.entries(skillsByDifficulty)) {
        ++total;
        if (Number(difficulty) <= floor) {
          ++validated;
        }
      }
    }

    if (total === 0) return 0;

    return (validated / total) * 100;
  }
}

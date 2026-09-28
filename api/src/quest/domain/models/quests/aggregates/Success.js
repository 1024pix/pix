import uniqBy from 'lodash/uniqBy.js';

import { KnowledgeElement } from '../../../../../shared/domain/models/KnowledgeElement.js';

export class Success {
  constructor({ knowledgeElements, campaignSkills = [], targetProfileSkills = [] }) {
    this.knowledgeElements = knowledgeElements;
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
    const validatedSkillsCount = this.knowledgeElements.filter(
      (ke) => ke.status === KnowledgeElement.StatusType.VALIDATED && skillIds.includes(ke.skillId),
    ).length;
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
    const sortedKEByDateDesc = this.knowledgeElements.toSorted((keA, keB) => keB.createdAt - keA.createdAt);
    let total = 0;
    let validated = 0;
    for (const cappedTube of cappedTubes) {
      const skillsInTubeWithinMaxDifficulty = uniqCampaignSkills.filter(
        ({ tubeId, difficulty }) => tubeId === cappedTube.tubeId && difficulty <= cappedTube.level,
      );
      const skillsByDifficulty = Object.groupBy(skillsInTubeWithinMaxDifficulty, ({ difficulty }) => difficulty);
      for (const skills of Object.values(skillsByDifficulty)) {
        ++total;
        const skillIds = skills.map(({ id }) => id);
        const ke = sortedKEByDateDesc.find(({ skillId }) => skillIds.includes(skillId));
        if (ke?.status === KnowledgeElement.StatusType.VALIDATED) {
          ++validated;
        }
      }
    }

    if (total === 0) return 0;

    return (validated / total) * 100;
  }
}

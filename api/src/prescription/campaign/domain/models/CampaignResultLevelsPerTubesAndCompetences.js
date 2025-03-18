import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';

class CampaignResultLevelsPerTubesAndCompetences {
  #difficultyBySkillId;
  #tubesWithLevels;

  constructor({ campaignId, learningContent, knowledgeElementsByParticipation } = {}) {
    this.id = campaignId;
    this.learningContent = learningContent;
    this.knowledgeElementByParticipation = knowledgeElementsByParticipation;
    this.knowledgeElementsParticipations = Object.values(knowledgeElementsByParticipation);
    this.#difficultyBySkillId = learningContent.skills.reduce(
      (acc, skill) => ({ ...acc, [skill.id]: skill.difficulty }),
      {},
    );
    this.#tubesWithLevels = this.#getTubesWithLevels(learningContent.tubes);
  }

  #getTubesWithLevels(tubes) {
    const maxTubeLevels = tubes.map((tube) => {
      const participationsReachedLevels = this.#computeParticipationsReachedLevels(tube);

      const maxLevel = tube.skills.reduce(
        (maxLevel, skill) => (skill.difficulty > maxLevel ? skill.difficulty : maxLevel),
        -Infinity,
      );

      const meanLevel =
        participationsReachedLevels.reduce((acc, current) => acc + current, 0) / participationsReachedLevels.length;

      return {
        id: tube.id,
        competenceId: tube.competenceId,
        practicalTitle: tube.practicalTitle,
        practicalDescription: tube.practicalDescription,
        maxLevel,
        meanLevel,
      };
    });
    return maxTubeLevels;
  }

  get campaignLevelsPerTube() {
    return this.#tubesWithLevels;
  }

  get campaignLevelsPerCompetence() {
    const maxCompetenceLevels = this.learningContent.competences.map((competence) => {
      const averageTubesMaxReachableLevel =
        this.#tubesWithLevels.reduce((maxLevel, tube) => maxLevel + tube.maxLevel, 0) / this.#tubesWithLevels.length;

      const averageTubesMeanReachedLevel =
        this.#tubesWithLevels.reduce((meanLevel, tube) => meanLevel + tube.meanLevel, 0) / this.#tubesWithLevels.length;

      return {
        id: competence.id,
        index: competence.index,
        name: competence.name,
        description: competence.description,
        maxLevel: averageTubesMaxReachableLevel,
        meanLevel: averageTubesMeanReachedLevel,
      };
    });
    return maxCompetenceLevels;
  }

  get campaignMaxReachableLevel() {
    return (
      this.campaignLevelsPerTube.reduce((maxLevel, tube) => maxLevel + tube.maxLevel, 0) /
      this.campaignLevelsPerTube.length
    );
  }

  get campaignMeanReachedLevel() {
    return (
      this.campaignLevelsPerTube.reduce((meanLevel, tube) => meanLevel + tube.meanLevel, 0) /
      this.campaignLevelsPerTube.length
    );
  }

  #computeParticipationsReachedLevels(tube) {
    const skillIdsForTube = tube.skills.map((skill) => skill.id);
    return this.knowledgeElementsParticipations.map((knowledgeElements) =>
      this.#computeParticipationLevel(skillIdsForTube, knowledgeElements),
    );
  }

  #computeParticipationLevel(skillIds, knowledgeElements) {
    return knowledgeElements
      .filter((ke) => skillIds.includes(ke.skillId))
      .reduce((max, knowledgeElement) => {
        const skillDifficulty = this.#difficultyBySkillId[knowledgeElement.skillId];
        return knowledgeElement.status === KnowledgeElement.StatusType.VALIDATED && max < skillDifficulty
          ? skillDifficulty
          : max;
      }, 0);
  }
}

export { CampaignResultLevelsPerTubesAndCompetences };

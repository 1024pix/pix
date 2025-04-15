import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';

class CampaignResultLevelsPerTubesAndCompetences {
  #difficultyBySkillId;
  #tubesWithLevels;

  constructor({ campaignId, learningContent, knowledgeElementsByParticipation } = {}) {
    this.id = campaignId;
    this.learningContent = learningContent;
    this.knowledgeElementSnapshots = Object.values(knowledgeElementsByParticipation);
    this.#difficultyBySkillId = learningContent.skills.reduce(
      (acc, skill) => ({ ...acc, [skill.id]: skill.difficulty }),
      {},
    );
    this.#tubesWithLevels = this.#getTubesWithLevels(learningContent.tubes);
  }

  #getTubesWithLevels(tubes) {
    const maxTubeLevels = tubes.map((tube) => {
      const participationsReachedLevels = this.#computeParticipationsReachedLevelForTube(tube);
      const meanLevel = average(participationsReachedLevels);

      const maxLevel = tube.getHardestSkill().difficulty;

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

  get levelsPerTube() {
    return this.#tubesWithLevels;
  }

  get levelsPerCompetence() {
    const maxCompetenceLevels = this.learningContent.competences.map((competence) => {
      const tubes = this.#tubesWithLevels.filter((tube) => tube.competenceId === competence.id);
      const averageTubesMaxReachableLevel = averageBy(tubes, 'maxLevel');
      const averageTubesMeanReachedLevel = averageBy(tubes, 'meanLevel');

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

  get maxReachableLevel() {
    return averageBy(this.levelsPerTube, 'maxLevel');
  }

  get meanReachedLevel() {
    return averageBy(this.levelsPerTube, 'meanLevel');
  }

  #computeParticipationsReachedLevelForTube(tube) {
    const skillIdsForTube = tube.skills.map((skill) => skill.id);
    return this.knowledgeElementSnapshots.map((knowledgeElements) =>
      this.#computeParticipationReachedLevelForTube(skillIdsForTube, knowledgeElements),
    );
  }

  #computeParticipationReachedLevelForTube(skillIds, knowledgeElements) {
    const validatedKe = knowledgeElements
      .filter((ke) => skillIds.includes(ke.skillId))
      .filter((ke) => ke.status === KnowledgeElement.StatusType.VALIDATED);

    if (validatedKe.length === 0) {
      return 0;
    }
    return Math.max(...validatedKe.map((knowledgeElement) => this.#difficultyBySkillId[knowledgeElement.skillId]));
  }
}

const averageBy = (collection, propName) => {
  if (!propName) {
    return collection.reduce((acc, value) => value + acc, 0) / collection.length;
  }
  return collection.reduce((acc, item) => acc + item[propName], 0) / collection.length;
};
const average = (collection) => averageBy(collection);

export { CampaignResultLevelsPerTubesAndCompetences };

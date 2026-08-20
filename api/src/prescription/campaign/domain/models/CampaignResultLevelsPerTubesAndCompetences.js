import { CompetenceResultForKnowledgeStates } from './CompetenceResultForKnowledgeStates.js';
import { TubeResultForKnowledgeStates } from './TubeResultForKnowledgeStates.js';

class CampaignResultLevelsPerTubesAndCompetences {
  #tubesWithLevels;
  #competencesWithLevels;

  constructor({ id, learningContent } = {}) {
    this.id = id;
    this.learningContent = learningContent;

    this.#tubesWithLevels = learningContent.tubes.map((tube) => {
      return new TubeResultForKnowledgeStates({
        tube,
        competence: this.learningContent.competences.find((competence) => competence.id === tube.competenceId),
      });
    });

    this.#competencesWithLevels = this.learningContent.competences.map(
      (competence) =>
        new CompetenceResultForKnowledgeStates({
          competence,
        }),
    );
  }

  get levelsPerTube() {
    return this.#tubesWithLevels;
  }

  get levelsPerCompetence() {
    return this.#competencesWithLevels;
  }

  get maxReachableLevel() {
    return averageBy(this.levelsPerTube, 'maxLevel');
  }

  get meanReachedLevel() {
    return averageBy(this.levelsPerTube, 'meanLevel');
  }

  /** @param {Object.<number, KnowledgeState>} knowledgeStatesByParticipation */
  addKnowledgeStates(knowledgeStatesByParticipation) {
    this.#competencesWithLevels.forEach((competenceResult) =>
      competenceResult.addKnowledgeStates(Object.values(knowledgeStatesByParticipation)),
    );
    this.#tubesWithLevels.forEach((tubesWithLevel) =>
      tubesWithLevel.addKnowledgeStates(Object.values(knowledgeStatesByParticipation)),
    );
  }
}

const averageBy = (collection, propName) => {
  if (!propName) {
    return collection.reduce((acc, value) => value + acc, 0) / collection.length;
  }
  return collection.reduce((acc, item) => acc + item[propName], 0) / collection.length;
};

export { CampaignResultLevelsPerTubesAndCompetences };

import { CompetenceResultForKnowledgeElementSnapshots } from './CompetenceResultForKnowledgeElementSnapshots.js';
import { TubeResultForKnowledgeElementSnapshots } from './TubeResultForKnowledgeElementSnapshots.js';

class CampaignResultLevelsPerTubesAndCompetences {
  #tubesWithLevels;
  #competencesWithLevels;

  constructor({ id, learningContent } = {}) {
    this.id = id;
    this.learningContent = learningContent;

    this.#tubesWithLevels = learningContent.tubes.map((tube) => {
      const competence = this.learningContent.competences.find((competence) => competence.id === tube.competenceId);
      return new TubeResultForKnowledgeElementSnapshots({
        tube,
        competence,
        area: this.learningContent.findAreaOfCompetence(competence),
      });
    });

    this.#competencesWithLevels = this.learningContent.competences.map(
      (competence) =>
        new CompetenceResultForKnowledgeElementSnapshots({
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

  addKnowledgeElementSnapshots(knowledgeElementSnapshots) {
    this.#competencesWithLevels.forEach((competenceResult) =>
      competenceResult.addKnowledgeElementSnapshots(Object.values(knowledgeElementSnapshots)),
    );
    this.#tubesWithLevels.forEach((tubesWithLevel) =>
      tubesWithLevel.addKnowledgeElementSnapshots(Object.values(knowledgeElementSnapshots)),
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

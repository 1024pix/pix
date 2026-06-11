import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';

class TubeResultForKnowledgeElementSnapshots {
  #tube;
  #competence;
  id;
  competenceId;
  competenceName;
  title;
  description;
  maxLevel = 0;
  meanLevel = 0;
  #sum = 0;
  #count = 0;

  constructor({ tube, competence } = {}) {
    this.#tube = tube;
    this.#competence = competence;
    this.id = tube.id;
    this.competenceId = competence.id;
    this.competenceName = competence.name;
    this.title = tube.practicalTitle;
    this.description = tube.practicalDescription;
    this.maxLevel = tube.maxLevel;
  }

  addKnowledgeElementSnapshots(knowledgeElementSnapshots) {
    const skillIds = this.#tube.skills.map((skill) => skill.id);
    // TODO: vérifier si on peut utiliser ceux du tubes,
    const difficultyBySkillId = this.#competence.skills.reduce(
      (acc, skill) => ({ ...acc, [skill.id]: skill.difficulty }),
      {},
    );

    const tubeValidatedKnowledgeElementSnapshots = knowledgeElementSnapshots.map((knowledgeElementSnapshot) =>
      knowledgeElementSnapshot
        .filter((ke) => ke.status === KnowledgeElement.StatusType.VALIDATED)
        .filter((ke) => skillIds.includes(ke.skillId)),
    );

    const knowledgeElementSnapshotReachedLevels = tubeValidatedKnowledgeElementSnapshots.map(
      (knowledgeElementSnapshot) => {
        if (knowledgeElementSnapshot.length === 0) {
          return 0;
        }
        return Math.max(
          ...knowledgeElementSnapshot.map((knowledgeElement) => difficultyBySkillId[knowledgeElement.skillId]),
        );
      },
    );

    const sum = knowledgeElementSnapshotReachedLevels.reduce((acc, value) => acc + value, 0);
    const count = knowledgeElementSnapshotReachedLevels.length;

    this.#sum += sum;
    this.#count += count;
    this.meanLevel = this.#count === 0 ? 0 : this.#sum / this.#count;
  }
}

export { TubeResultForKnowledgeElementSnapshots };

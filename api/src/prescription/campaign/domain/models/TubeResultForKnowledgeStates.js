class TubeResultForKnowledgeStates {
  #tube;
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
    this.id = tube.id;
    this.competenceId = competence.id;
    this.competenceName = competence.name;
    this.title = tube.practicalTitle;
    this.description = tube.practicalDescription;
    this.maxLevel = tube.maxLevel;
  }

  /**
   * Niveau moyen atteint sur ce tube : pour chaque participation, le plus haut
   * acquis du tube que son état donne validé.
   *
   * @param {KnowledgeState[]} knowledgeStates un état par participation
   */
  addKnowledgeStates(knowledgeStates) {
    const reachedLevels = knowledgeStates.map((knowledgeState) => {
      const validatedDifficulties = this.#tube.skills
        .filter((skill) => knowledgeState.isValidated(skill))
        .map(({ difficulty }) => difficulty);
      return validatedDifficulties.length === 0 ? 0 : Math.max(...validatedDifficulties);
    });

    this.#sum += reachedLevels.reduce((acc, value) => acc + value, 0);
    this.#count += reachedLevels.length;
    this.meanLevel = this.#count === 0 ? 0 : this.#sum / this.#count;
  }
}

export { TubeResultForKnowledgeStates };

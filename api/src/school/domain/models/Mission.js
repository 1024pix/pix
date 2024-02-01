class Mission {
  constructor({ id, name, competenceId, thematicId, status, learningObjectives, validatedObjectives } = {}) {
    this.id = id;
    this.name = name;
    this.competenceId = competenceId;
    this.thematicId = thematicId;
    this.status = status;
    this.learningObjectives = learningObjectives;
    this.validatedObjectives = validatedObjectives;
  }
}

export { Mission };

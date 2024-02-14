class Mission {
  constructor({ id, name, competenceId, thematicId, status, learningObjectives, validatedObjectives, areaCode } = {}) {
    this.id = id;
    this.name = name;
    this.competenceId = competenceId;
    this.thematicId = thematicId;
    this.status = status;
    this.areaCode = areaCode;
    this.learningObjectives = learningObjectives;
    this.validatedObjectives = validatedObjectives;
  }
}

export { Mission };

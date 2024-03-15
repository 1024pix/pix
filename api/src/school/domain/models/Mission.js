class Mission {
  constructor({
    id,
    name,
    competenceId,
    competenceName,
    thematicId,
    learningObjectives,
    validatedObjectives,
    areaCode,
    startedBy,
  } = {}) {
    this.id = id;
    this.name = name;
    this.competenceId = competenceId;
    this.competenceName = competenceName;
    this.thematicId = thematicId;
    this.areaCode = areaCode;
    this.learningObjectives = learningObjectives;
    this.validatedObjectives = validatedObjectives;
    this.startedBy = startedBy;
  }
}

export { Mission };

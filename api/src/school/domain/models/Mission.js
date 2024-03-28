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
    content,
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
    this.content = content;
  }
}

class MissionContent {
  constructor({ tutorialChallenges = [], trainingChallenges = [], validationChallenges = [], dareChallenges = [] }) {
    this.tutorialChallenges = tutorialChallenges;
    this.trainingChallenges = trainingChallenges;
    this.validationChallenges = validationChallenges;
    this.dareChallenges = dareChallenges;
  }
}

export { Mission };

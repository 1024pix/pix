import { Activity } from './Activity.js';

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
    content = new MissionContent(),
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
  constructor({
    tutorialChallenges = [],
    trainingChallenges = [],
    validationChallenges = [],
    dareChallenges = [],
  } = {}) {
    this.tutorialChallenges = tutorialChallenges;
    this.trainingChallenges = trainingChallenges;
    this.validationChallenges = validationChallenges;
    this.dareChallenges = dareChallenges;
  }

  getChallengeIds(activityLevel) {
    switch (activityLevel) {
      case Activity.levels.TUTORIAL:
        return this.tutorialChallenges;
      case Activity.levels.TRAINING:
        return this.trainingChallenges;
      case Activity.levels.VALIDATION:
        return this.validationChallenges;
      case Activity.levels.CHALLENGE:
        return this.dareChallenges;
    }
  }
}

export { Mission, MissionContent };

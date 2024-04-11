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
    this.content = new MissionContent(content);
  }

  getChallengeId({ activityLevel, challengeIndex, alternativeVersion }) {
    if (this.#unknownActivityLevel(activityLevel)) {
      throw Error(`Unknown activity level ${activityLevel}`);
    }
    const activityChallengeIds = this.getChallengeIds(activityLevel);
    const challengeIds = activityChallengeIds[challengeIndex];

    return challengeIds?.[alternativeVersion] || challengeIds?.[0];
  }

  getChallengeIds(activityLevel) {
    switch (activityLevel) {
      case Activity.levels.TUTORIAL:
        return this.content.tutorialChallenges;
      case Activity.levels.TRAINING:
        return this.content.trainingChallenges;
      case Activity.levels.VALIDATION:
        return this.content.validationChallenges;
      case Activity.levels.CHALLENGE:
        return this.content.dareChallenges;
    }
  }

  #unknownActivityLevel(activityLevel) {
    return !Object.keys(Activity.levels).includes(activityLevel);
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
}

export { Mission };

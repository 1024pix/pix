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
    introductionMediaUrl,
    introductionMediaType,
    introductionMediaAlt,
    documentationUrl,
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
    this.introductionMediaUrl = introductionMediaUrl;
    this.introductionMediaType = introductionMediaType;
    this.introductionMediaAlt = introductionMediaAlt;
    this.documentationUrl = documentationUrl;
    this.startedBy = startedBy;
    this.content = new MissionContent(content);
  }

  getChallengeId({ activityInfo, challengeIndex, alternativeVersion }) {
    if (this.#unknownActivityLevel(activityInfo.level)) {
      throw Error(`Unknown activity level ${activityInfo.level}`);
    }
    const activityChallengeIds = this.getChallengeIds(activityInfo);
    const challengeIds = activityChallengeIds[challengeIndex];

    return challengeIds?.[alternativeVersion] || challengeIds?.[0];
  }

  getChallengeIds(activityInfo) {
    switch (activityInfo.level) {
      case Activity.levels.TUTORIAL:
        return this.content.steps[activityInfo.stepIndex].tutorialChallenges;
      case Activity.levels.TRAINING:
        return this.content.steps[activityInfo.stepIndex].trainingChallenges;
      case Activity.levels.VALIDATION:
        return this.content.steps[activityInfo.stepIndex].validationChallenges;
      case Activity.levels.CHALLENGE:
        return this.content.dareChallenges;
    }
  }

  get stepCount() {
    return this.content.steps.length;
  }

  #unknownActivityLevel(activityLevel) {
    return !Object.keys(Activity.levels).includes(activityLevel);
  }
}

class MissionContent {
  constructor({ steps = [new MissionStep()], dareChallenges = [] } = {}) {
    this.steps = steps.map((step) => new MissionStep(step));
    this.dareChallenges = dareChallenges;
  }
}

class MissionStep {
  constructor({ name, tutorialChallenges = [], trainingChallenges = [], validationChallenges = [] } = {}) {
    this.name = name;
    this.tutorialChallenges = tutorialChallenges;
    this.trainingChallenges = trainingChallenges;
    this.validationChallenges = validationChallenges;
  }
}

export { Mission, MissionContent, MissionStep };

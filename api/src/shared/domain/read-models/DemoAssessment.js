import { Assessment } from '../models/Assessment.js';

class DemoAssessment {
  constructor(assessment) {
    this.id = assessment.id;
    this.state = assessment.state;
    this.type = Assessment.types.DEMO;
    this.courseId = assessment.courseId;
    this.title = assessment.title;
    this.answers = [];
    this.lastQuestionState = assessment.lastQuestionState;
    this.method = Assessment.methods.COURSE_DETERMINED;
    this.hasOngoingChallengeLiveAlert = false;
    this.hasOngoingCompanionLiveAlert = false;
    this.hasCheckpoints = false;
    this.showChallengeStepper = true;
    this.showLevelup = false;
    this.showQuestionCounter = true;
    this.answers = assessment.answers;
    this.orderedChallengeIdsAnswered = assessment.answers?.map((answer) => answer.challengeId) ?? [];
    this.competenceId = assessment.competenceId;
    this.nextChallenge = assessment.nextChallenge;
  }

  get course() {
    return { id: this.courseId };
  }
}

export { DemoAssessment };

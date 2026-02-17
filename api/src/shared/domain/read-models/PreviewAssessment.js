import { Progression } from '../../../evaluation/domain/models/Progression.js';
import { Assessment } from '../models/Assessment.js';

class PreviewAssessment {
  constructor(assessment) {
    this.id = assessment.id;
    this.state = assessment.state;
    this.type = Assessment.types.PREVIEW;
    this.title = 'Preview';
    this.lastQuestionState = assessment.lastQuestionState;
    this.method = Assessment.methods.CHOSEN;
    this.hasOngoingChallengeLiveAlert = false;
    this.hasOngoingCompanionLiveAlert = false;
    this.hasCheckpoints = false;
    this.showChallengeStepper = false;
    this.showGlobalProgression = false;
    this.showLevelup = false;
    this.showQuestionCounter = true;
    this.answers = assessment.answers;
    this.orderedChallengeIdsAnswered = assessment.answers?.map((answer) => answer.challengeId) ?? [];
    this.competenceId = assessment.competenceId;
    this.nextChallenge = assessment.nextChallenge;
  }

  get progression() {
    return { id: Progression.generateIdFromAssessmentId(this.id) };
  }
}

export { PreviewAssessment };

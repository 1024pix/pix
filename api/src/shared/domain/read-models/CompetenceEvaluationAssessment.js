import { Progression } from '../../../evaluation/domain/models/Progression.js';
import { Assessment } from '../models/Assessment.js';

class CompetenceEvaluationAssessment {
  constructor(assessment) {
    this.id = assessment.id;
    this.state = assessment.state;
    this.type = Assessment.types.COMPETENCE_EVALUATION;
    this.title = assessment.title;
    this.lastQuestionState = assessment.lastQuestionState;
    this.method = Assessment.methods.SMART_RANDOM;
    this.hasOngoingChallengeLiveAlert = false;
    this.hasOngoingCompanionLiveAlert = false;
    this.hasCheckpoints = true;
    this.showChallengeStepper = true;
    this.showGlobalProgression = false;
    this.showLevelup = true;
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

export { CompetenceEvaluationAssessment };

import { Progression } from '../../../evaluation/domain/models/Progression.js';
import { Assessment } from '../models/Assessment.js';
class CampaignAssessment {
  constructor(assessment, globalProgression = null) {
    this.id = assessment.id;
    this.createdAt = assessment.createdAt;
    this.codeCampaign = assessment.campaign?.code;
    this.state = assessment.state;
    this.title = assessment.campaign?.title ?? '';
    this.type = Assessment.types.CAMPAIGN;
    this.lastQuestionState = assessment.lastQuestionState;
    this.method = Assessment.methods.SMART_RANDOM;
    this.hasOngoingChallengeLiveAlert = false;
    this.hasOngoingCompanionLiveAlert = false;
    this.hasCheckpoints = assessment.campaign?.isAssessment ?? false;
    this.showChallengeStepper = assessment.campaign?.isAssessment ?? false;
    this.showGlobalProgression = assessment.campaign?.isExam ?? false;
    this.showLevelup = assessment.campaign?.isAssessment ?? false;
    this.showQuestionCounter = assessment.campaign?.isAssessment ?? false;
    this.answers = assessment.answers;
    this.orderedChallengeIdsAnswered = assessment.answers?.map((answer) => answer.challengeId) ?? [];
    this.competenceId = assessment.competenceId;
    this.nextChallenge = assessment.nextChallenge;
    this.globalProgression = globalProgression;
  }

  get progression() {
    if (!this.hasCheckpoints) {
      return undefined;
    }
    return { id: Progression.generateIdFromAssessmentId(this.id) };
  }
}

export { CampaignAssessment };

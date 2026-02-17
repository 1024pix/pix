import { CertificationChallengeLiveAlertStatus } from '../../../certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Assessment } from '../models/Assessment.js';

class CertificationAssessment {
  constructor(assessment) {
    this.id = assessment.id;
    this.certificationCourseId = assessment.certificationCourseId;
    this.state = assessment.state;
    this.type = Assessment.types.CERTIFICATION;
    this.lastQuestionState = assessment.lastQuestionState;
    this.method = Assessment.methods.CERTIFICATION_DETERMINED;
    this.challengeLiveAlerts = assessment.challengeLiveAlerts;
    this.companionLiveAlerts = assessment.companionLiveAlerts;
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

  get certificationCourse() {
    return { id: this.certificationCourseId };
  }

  get title() {
    return this.certificationCourseId;
  }

  get certificationNumber() {
    return this.certificationCourseId;
  }

  get hasOngoingChallengeLiveAlert() {
    if (!this.challengeLiveAlerts) {
      return false;
    }

    return this.challengeLiveAlerts.some(
      (challengeLiveAlert) => challengeLiveAlert.status === CertificationChallengeLiveAlertStatus.ONGOING,
    );
  }

  get hasOngoingCompanionLiveAlert() {
    if (!this.companionLiveAlerts) {
      return false;
    }

    return this.companionLiveAlerts.some(
      (companionLiveAlert) => companionLiveAlert.status === CertificationCompanionLiveAlertStatus.ONGOING,
    );
  }
}

export { CertificationAssessment };

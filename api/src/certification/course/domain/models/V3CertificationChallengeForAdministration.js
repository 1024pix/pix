export class V3CertificationChallengeForAdministration {
  constructor({ challengeId, answerStatus, validatedLiveAlert, answeredAt }) {
    this.challengeId = challengeId;
    this.answerStatus = answerStatus;
    this.validatedLiveAlert = validatedLiveAlert;
    this.answeredAt = answeredAt;
  }
}

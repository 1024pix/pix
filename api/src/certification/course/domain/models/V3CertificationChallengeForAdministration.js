export class V3CertificationChallengeForAdministration {
  constructor({ challengeId, answerStatus, validatedLiveAlert }) {
    this.challengeId = challengeId;
    this.answerStatus = answerStatus;
    this.validatedLiveAlert = validatedLiveAlert;
  }
}

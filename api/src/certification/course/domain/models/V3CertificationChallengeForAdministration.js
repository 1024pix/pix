export class V3CertificationChallengeForAdministration {
  constructor({ challengeId, answerStatus, validatedLiveAlert, answeredAt, competenceId, skillName }) {
    this.challengeId = challengeId;
    this.answerStatus = answerStatus;
    this.validatedLiveAlert = validatedLiveAlert;
    this.answeredAt = answeredAt;
    this.competenceId = competenceId;
    this.skillName = skillName;
  }
}

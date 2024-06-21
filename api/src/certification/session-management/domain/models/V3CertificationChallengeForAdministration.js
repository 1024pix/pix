export class V3CertificationChallengeForAdministration {
  constructor({
    challengeId,
    answerStatus,
    answerValue,
    validatedLiveAlert,
    answeredAt,
    competenceId,
    skillName,
    competenceName,
    competenceIndex,
  }) {
    this.challengeId = challengeId;
    this.answerStatus = answerStatus;
    this.validatedLiveAlert = validatedLiveAlert;
    this.answeredAt = answeredAt;
    this.answerValue = answerValue;
    this.competenceId = competenceId;
    this.skillName = skillName;
    this.competenceName = competenceName;
    this.competenceIndex = competenceIndex;
  }

  setCompetenceDetails(list) {
    const competence = list.find(({ id }) => id === this.competenceId);

    this.competenceName = competence.name;
    this.competenceIndex = competence.index;
  }
}

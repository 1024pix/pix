const CertificationChallengeLiveAlertStatus = Object.freeze({
  ONGOING: 'ongoing',
  DISMISSED: 'dismissed',
  VALIDATED: 'validated',
});

class CertificationChallengeLiveAlert {
  constructor({
    id,
    assessmentId,
    challengeId,
    status = CertificationChallengeLiveAlertStatus.ONGOING,
    questionNumber,
    createdAt,
    updatedAt,
    hasEmbed,
    isFocus,
    hasImage,
    hasAttachment,
  } = {}) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.questionNumber = questionNumber;
    this.hasEmbed = hasEmbed;
    this.isFocus = isFocus;
    this.hasImage = hasImage;
    this.hasAttachment = hasAttachment;
  }

  dismiss() {
    this.status = CertificationChallengeLiveAlertStatus.DISMISSED;
  }

  validate() {
    this.status = CertificationChallengeLiveAlertStatus.VALIDATED;
  }
}

export { CertificationChallengeLiveAlert, CertificationChallengeLiveAlertStatus };

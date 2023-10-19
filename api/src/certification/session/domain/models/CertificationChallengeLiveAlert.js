const CertificationChallengeLiveAlertStatus = Object.freeze({
  ONGOING: 'ongoing',
  DISMISSED: 'dismissed',
  ACCEPTED: 'accepted',
});

class CertificationChallengeLiveAlert {
  constructor({
    id,
    assessmentId,
    challengeId,
    status = CertificationChallengeLiveAlertStatus.ONGOING,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  dismiss() {
    this.status = CertificationChallengeLiveAlertStatus.DISMISSED;
  }

  validate() {
    this.status = CertificationChallengeLiveAlertStatus.ACCEPTED;
  }
}

export { CertificationChallengeLiveAlert, CertificationChallengeLiveAlertStatus };

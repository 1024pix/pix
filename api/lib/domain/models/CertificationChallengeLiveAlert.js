const CertificationChallengeLiveAlertStatus = Object.freeze({
  ONGOING: 'ongoing',
  DISMISSED: 'dismissed',
  ACCEPTED: 'accepted',
});

class CertificationChallengeLiveAlert {
  constructor({ assessmentId, challengeId, status = CertificationChallengeLiveAlertStatus.ONGOING } = {}) {
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
    this.status = status;
  }
}

export { CertificationChallengeLiveAlert, CertificationChallengeLiveAlertStatus };

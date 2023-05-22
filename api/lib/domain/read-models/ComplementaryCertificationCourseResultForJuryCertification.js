const complementaryCertificationStatus = {
  ACQUIRED: 'Validée',
  REJECTED: 'Rejetée',
};

class ComplementaryCertificationCourseResultForJuryCertification {
  constructor({ id, partnerKey, acquired, label }) {
    this.id = id;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
    this.label = label;
  }

  static from({ id, partnerKey, acquired, label }) {
    return new ComplementaryCertificationCourseResultForJuryCertification({ id, partnerKey, acquired, label });
  }

  get status() {
    return this.acquired ? complementaryCertificationStatus.ACQUIRED : complementaryCertificationStatus.REJECTED;
  }
}

ComplementaryCertificationCourseResultForJuryCertification.statuses = complementaryCertificationStatus;

export { ComplementaryCertificationCourseResultForJuryCertification };

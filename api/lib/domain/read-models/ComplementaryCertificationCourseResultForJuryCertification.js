const complementaryCertificationStatus = {
  ACQUIRED: 'Validée',
  REJECTED: 'Rejetée',
};

class ComplementaryCertificationCourseResultForJuryCertification {
  constructor({ id, complementaryCertificationBadgeId, acquired, label }) {
    this.id = id;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.acquired = acquired;
    this.label = label;
  }

  static from({ id, complementaryCertificationBadgeId, acquired, label }) {
    return new ComplementaryCertificationCourseResultForJuryCertification({
      id,
      complementaryCertificationBadgeId,
      acquired,
      label,
    });
  }

  get status() {
    return this.acquired ? complementaryCertificationStatus.ACQUIRED : complementaryCertificationStatus.REJECTED;
  }
}

ComplementaryCertificationCourseResultForJuryCertification.statuses = complementaryCertificationStatus;

export { ComplementaryCertificationCourseResultForJuryCertification };

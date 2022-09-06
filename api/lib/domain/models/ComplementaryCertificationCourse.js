class ComplementaryCertificationCourse {
  constructor({ id, complementaryCertificationId, certificationCourseId, complementaryCertificationBadgeId }) {
    this.id = id;
    this.complementaryCertificationId = complementaryCertificationId;
    this.certificationCourseId = certificationCourseId;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
  }
}

module.exports = ComplementaryCertificationCourse;

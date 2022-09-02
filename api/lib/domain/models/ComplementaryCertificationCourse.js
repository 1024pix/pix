class ComplementaryCertificationCourse {
  constructor({ id, complementaryCertificationId, certificationCourseId, complementaryCertificationBadgeId }) {
    this.id = id;
    this.complementaryCertificationId = complementaryCertificationId;
    this.certificationCourseId = certificationCourseId;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
  }

  static fromComplementaryCertificationId(id) {
    return new ComplementaryCertificationCourse({
      complementaryCertificationId: id,
    });
  }
}

module.exports = ComplementaryCertificationCourse;

class ComplementaryCertificationCourse {
  constructor({ complementaryCertificationId, certificationCourseId }) {
    this.complementaryCertificationId = complementaryCertificationId;
    this.certificationCourseId = certificationCourseId;
  }

  static fromComplementaryCertificationId(id) {
    return new ComplementaryCertificationCourse({
      complementaryCertificationId: id,
    });
  }
}

module.exports = ComplementaryCertificationCourse;

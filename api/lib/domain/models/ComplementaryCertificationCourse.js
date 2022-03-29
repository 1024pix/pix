class ComplementaryCertificationCourse {
  constructor({ id, complementaryCertificationId, certificationCourseId }) {
    this.id = id;
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

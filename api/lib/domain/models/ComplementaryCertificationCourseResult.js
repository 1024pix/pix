class ComplementaryCertificationCourseResult {
  constructor({ certificationCourseId, partnerKey, acquired } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
  }

  static from({ certificationCourseId, partnerKey, acquired }) {
    return new ComplementaryCertificationCourseResult({ certificationCourseId, partnerKey, acquired });
  }
}

module.exports = ComplementaryCertificationCourseResult;

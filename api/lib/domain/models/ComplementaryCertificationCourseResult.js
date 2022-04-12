class ComplementaryCertificationCourseResult {
  constructor({ certificationCourseId, partnerKey, source, acquired } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
    this.source = source;
  }

  static from({ certificationCourseId, partnerKey, acquired, source }) {
    return new ComplementaryCertificationCourseResult({ certificationCourseId, partnerKey, acquired, source });
  }
}

module.exports = ComplementaryCertificationCourseResult;

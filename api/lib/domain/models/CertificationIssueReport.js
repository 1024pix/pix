class CertificationIssueReport {
  constructor(
    {
      id,
      certificationCourseId,
      category,
      description,

    } = {}) {
    this.id = id;
    this.certificationCourseId = certificationCourseId;
    this.category = category;
    this.description = description;
  }
}

module.exports = CertificationIssueReport;

class CertificationIssueReport {
  constructor(
    {
      id,
      certificationCourseId,
      categoryId,
      description,

    } = {}) {
    this.id = id;
    this.certificationCourseId = certificationCourseId;
    this.categoryId = categoryId;
    this.description = description;
  }
}

module.exports = CertificationIssueReport;

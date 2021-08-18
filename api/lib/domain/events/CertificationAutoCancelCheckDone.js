module.exports = class CertificationAutoCancelCheckDone {
  constructor({ certificationCourseId, juryId, commentForJury }) {
    this.certificationCourseId = certificationCourseId;
    this.juryId = juryId;
    this.commentForJury = commentForJury;
  }
};

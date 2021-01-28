module.exports = class SessionForPublication {
  constructor(certificationCourses, globalComment) {
    this.certificationCourses = certificationCourses;
    this.globalComment = globalComment;
  }

  isPublishable() {
    if (this.globalComment) {
      return false;
    }
  }
};

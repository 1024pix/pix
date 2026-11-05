import { CertificationAssessment } from './CertificationAssessment.js';
// todo lolo finalize() should be in sessionManagement
export class Session {
  constructor({
    id,
    finalizedAt,
    examinerGlobalComment,
    hasIncident,
    hasJoiningIssue,
    certificationCenterName,
    date,
    time,
    certificationCourses,
  }) {
    this.id = id;
    this.finalizedAt = finalizedAt;
    this.examinerGlobalComment = examinerGlobalComment;
    this.hasIncident = hasIncident;
    this.hasJoiningIssue = hasJoiningIssue;
    this.certificationCenterName = certificationCenterName;
    this.date = date;
    this.time = time;
    this.certificationCourses = certificationCourses;
  }

  get isFinalized() {
    return !!this.finalizedAt;
  }

  get hasExaminerGlobalComment() {
    return !!this.examinerGlobalComment;
  }

  get hasStarted() {
    return this.certificationCourses.length > 0;
  }

  get uncompletedCertificationCount() {
    return this.certificationCourses.filter((certificationCourse) =>
      CertificationAssessment.uncompletedAssessmentStates.includes(certificationCourse.assessmentState),
    ).length;
  }

  finalize({ examinerGlobalComment, hasIncident, hasJoiningIssue, certificationReports }) {
    const now = new Date();
    this.examinerGlobalComment = examinerGlobalComment;
    this.hasIncident = hasIncident;
    this.hasJoiningIssue = hasJoiningIssue;
    this.finalizedAt = new Date();
    for (const certificationCourse of this.certificationCourses) {
      const certificationReport = certificationReports.find(
        ({ certificationCourseId }) => certificationCourseId === certificationCourse.id,
      );
      if (!certificationReport) {
        continue;
      }
      certificationCourse.finalize({ finalizedAt: now, certificationReport });
    }
  }
}

export class JobController {
  constructor(jobName) {
    this.jobName = jobName;
  }

  isJobEnabled() {
    return true;
  }
}

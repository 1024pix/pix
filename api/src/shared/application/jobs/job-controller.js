export class JobController {
  constructor(jobName, jobGroup = JobGroup.DEFAULT) {
    this.jobName = jobName;
    this.jobGroup = jobGroup || 'default';
  }

  isJobEnabled() {
    return true;
  }
}

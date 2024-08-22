import { JobController } from './job-controller.js';

export class JobScheduleController extends JobController {
  constructor(jobName, { jobCron, ...options } = {}) {
    super(jobName, options);
    this.jobCron = jobCron;
  }
}

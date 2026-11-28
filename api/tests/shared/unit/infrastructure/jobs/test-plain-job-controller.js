import { JobController, JobTeam } from '../../../../../src/shared/application/jobs/job-controller.js';

export class TestPlainJobController extends JobController {
  constructor() {
    super('Test.PlainJob', { description: 'Test plain job.', team: JobTeam.STAFF });
  }

  async handle() {
    return true;
  }
}

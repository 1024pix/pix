import { config } from '../../../../../config/config.js';
import { JobController, JobTeam } from '../../../../../src/shared/application/jobs/job-controller.js';

export class TestToggleableJobController extends JobController {
  constructor() {
    super('Test.ToggleableJob', { description: 'Test job toggled by configuration.', team: JobTeam.STAFF });
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle() {
    return true;
  }
}

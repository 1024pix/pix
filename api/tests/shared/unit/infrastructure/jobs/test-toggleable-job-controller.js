import { config } from '../../../../../config/config.js';
import { JobController } from '../../../../../src/shared/application/jobs/job-controller.js';

export class TestToggleableJobController extends JobController {
  constructor() {
    super('Test.ToggleableJob');
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle() {
    return true;
  }
}

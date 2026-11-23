import { JobController } from '../../../../../src/shared/application/jobs/job-controller.js';

export class TestPlainJobController extends JobController {
  constructor() {
    super('Test.PlainJob');
  }

  async handle() {
    return true;
  }
}

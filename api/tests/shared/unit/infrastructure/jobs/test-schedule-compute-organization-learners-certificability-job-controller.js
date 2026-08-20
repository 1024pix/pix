import { JobScheduleController } from '../../../../../src/shared/application/jobs/job-schedule-controller.js';
import { config } from '../../../../../src/shared/config.js';

export class TestScheduleComputeOrganizationLearnersCertificabilityJobController extends JobScheduleController {
  constructor() {
    super('TEST.ScheduleComputeOrganizationLearnersCertificabilityJob', {
      jobCron: config.features.scheduleComputeOrganizationLearnersCertificability.cron,
    });
  }

  get legacyName() {
    return 'TEST.ComputeOrganizationLearnersCertificabilityJob';
  }

  async handle() {
    return true;
  }
}

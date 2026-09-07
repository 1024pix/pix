import { config } from '../../../../../config/config.js';
import { JobScheduleController } from '../../../../../src/shared/application/jobs/job-schedule-controller.js';

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

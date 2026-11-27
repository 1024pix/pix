import { config } from '../../../../../config/config.js';
import { JobTeam } from '../../../../../src/shared/application/jobs/job-controller.js';
import { JobScheduleController } from '../../../../../src/shared/application/jobs/job-schedule-controller.js';

export class TestScheduleComputeOrganizationLearnersCertificabilityJobController extends JobScheduleController {
  constructor() {
    super('TEST.ScheduleComputeOrganizationLearnersCertificabilityJob', {
      description: 'Test scheduled job with a legacy name.',
      team: JobTeam.STAFF,
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

import { JobScheduleController } from '../../../../../src/shared/application/jobs/job-schedule-controller.js';
import { config } from '../../../../../src/shared/config.js';

const { cpf } = config;

export class TestCpfExportSenderJobController extends JobScheduleController {
  constructor() {
    super('Test.CpfExportSenderJob', { jobCron: cpf.sendEmailJob.cron });
  }

  get isJobEnabled() {
    return cpf.exportSenderJobEnabled;
  }

  async handle() {
    return true;
  }
}

import { config } from '../../../../config/config.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { usecases } from '../../domain/usecases/index.js';

class ScheduleExportMigratedUserKnowledgeElementsJobController extends JobScheduleController {
  constructor() {
    super('ScheduleExportMigratedUserKnowledgeElementsJob', {
      jobCron: config.features.databaseHistory.scheduleExportMigratedUserKnowledgeElements.cron,
    });
  }

  /** The job runs only where a cron is configured. */
  get isJobEnabled() {
    return Boolean(this.jobCron);
  }

  async handle() {
    await usecases.exportMigratedUserKnowledgeElements({
      batchSize: config.migratedUserKnowledgeElementsExport.batchSize,
    });
  }
}

export { ScheduleExportMigratedUserKnowledgeElementsJobController };

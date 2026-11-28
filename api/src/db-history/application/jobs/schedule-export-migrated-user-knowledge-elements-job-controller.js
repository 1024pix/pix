import { config } from '../../../../config/config.js';
import { JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { usecases } from '../../domain/usecases/index.js';

class ScheduleExportMigratedUserKnowledgeElementsJobController extends JobScheduleController {
  constructor() {
    super('ScheduleExportMigratedUserKnowledgeElementsJob', {
      description:
        "Exporte périodiquement vers le data lake, en fichiers parquet, les acquis (knowledge elements) des utilisateurs migrés qui n'ont pas encore été exportés. Ne tourne que sur les environnements où un cron est configuré.",
      team: JobTeam.STAFF,
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

import { config } from '../../../../config/config.js';
import { JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { usecases } from '../../domain/usecases/index.js';

class SchedulePurgeMigratedUserKnowledgeElementsJobController extends JobScheduleController {
  constructor() {
    super('SchedulePurgeMigratedUserKnowledgeElementsJob', {
      description:
        'Supprime périodiquement, par lots, les acquis (knowledge elements) des utilisateurs migrés déjà exportés vers le data lake depuis plus longtemps que la durée de rétention. Ne tourne que sur les environnements où un cron est configuré.',
      team: JobTeam.STAFF,
      jobCron: config.features.databaseHistory.schedulePurgeMigratedUserKnowledgeElements.cron,
    });
  }

  /** The job runs only where a cron is configured. */
  get isJobEnabled() {
    return Boolean(this.jobCron);
  }

  async handle() {
    await usecases.purgeExportedMigratedUserKnowledgeElements({
      retentionDays: config.migratedUserKnowledgeElementsPurge.retentionDays,
      batchSize: config.migratedUserKnowledgeElementsPurge.batchSize,
    });
  }
}

export { SchedulePurgeMigratedUserKnowledgeElementsJobController };

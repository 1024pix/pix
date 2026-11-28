import { config } from '../../../../config/config.js';
import { JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { logger, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { RefreshLearningContentJob } from '../../domain/models/RefreshLearningContentJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class RefreshLearningContentJobController extends JobScheduleController {
  constructor() {
    super(RefreshLearningContentJob.name, {
      description:
        "Recharge périodiquement le cache du référentiel pédagogique de l'API à partir de la dernière release du LCMS.",
      team: JobTeam.CONTENU,
      jobCron: config.lcms.refreshJobCron,
    });
  }

  async handle() {
    try {
      await usecases.refreshLearningContent();
      logger.info({ event: SCOPES.LEARNING_CONTENT }, 'Learning Content refreshed');
    } catch (e) {
      logger.error({ err: e, event: SCOPES.LEARNING_CONTENT }, 'Error while refreshing cache');
      throw e;
    }
  }
}

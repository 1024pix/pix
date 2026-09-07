import { config } from '../../../../config/config.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { logger, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { RefreshLearningContentJob } from '../../domain/models/RefreshLearningContentJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class RefreshLearningContentJobController extends JobScheduleController {
  constructor() {
    super(RefreshLearningContentJob.name, { jobCron: config.lcms.refreshJobCron });
  }

  isJobEnabled() {
    return config.lcms.refreshJobCron !== null;
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

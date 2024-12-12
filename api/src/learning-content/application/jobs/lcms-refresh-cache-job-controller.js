import { JobController } from '../../../shared/application/jobs/job-controller.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { LcmsRefreshCacheJob } from '../../domain/models/LcmsRefreshCacheJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class LcmsRefreshCacheJobController extends JobController {
  constructor() {
    super(LcmsRefreshCacheJob.name);
  }

  async handle() {
    try {
      await usecases.refreshLearningContentCache();
      logger.info('Learning Content refreshed');
    } catch (e) {
      logger.error('Error while reloading cache', e);
      throw e;
    }
  }
}

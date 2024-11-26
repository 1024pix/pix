import { JobController } from '../../../shared/application/jobs/job-controller.js';
import { LcmsRefreshCacheJob } from '../../domain/models/LcmsRefreshCacheJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class LcmsRefreshCacheJobController extends JobController {
  constructor() {
    super(LcmsRefreshCacheJob.name);
  }

  async handle() {
    await usecases.refreshLearningContentCache();
  }
}

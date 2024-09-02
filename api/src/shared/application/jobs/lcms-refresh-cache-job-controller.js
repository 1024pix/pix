import { LcmsRefreshCacheJob } from '../../domain/models/LcmsRefreshCacheJob.js';
import * as learningContentDatasource from '../../infrastructure/datasources/learning-content/datasource.js';
import { JobController } from './job-controller.js';

export class LcmsRefreshCacheJobController extends JobController {
  constructor() {
    super(LcmsRefreshCacheJob.name);
  }

  async handle({ dependencies = { learningContentDatasource } }) {
    await dependencies.learningContentDatasource.refreshLearningContentCacheRecords();
  }
}

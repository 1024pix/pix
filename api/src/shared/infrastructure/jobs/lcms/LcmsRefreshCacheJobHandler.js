import { LcmsRefreshCacheJob } from './LcmsRefreshCacheJob.js';

class LcmsRefreshCacheJobHandler {
  constructor({ learningContentDatasource, logger }) {
    this.logger = logger;
    this.learningContentDatasource = learningContentDatasource;
  }

  async handle() {
    await this.learningContentDatasource.refreshLearningContentCacheRecords();
  }

  get name() {
    return LcmsRefreshCacheJob.name;
  }
}

export { LcmsRefreshCacheJobHandler };

import * as learningContentDatasource from '../../infrastructure/datasources/learning-content/datasource.js';

export class LcmsRefreshCacheJobController {
  async handle(_, dependencies = { learningContentDatasource }) {
    await dependencies.learningContentDatasource.refreshLearningContentCacheRecords();
  }
}

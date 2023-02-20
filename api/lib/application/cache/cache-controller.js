import LearningContentDatasources from '../../infrastructure/datasources/learning-content';
import learningContentDatasource from '../../infrastructure/datasources/learning-content/datasource';
import logger from '../../infrastructure/logger';
import _ from 'lodash';

export default {
  refreshCacheEntries(request, h) {
    learningContentDatasource
      .refreshLearningContentCacheRecords()
      .catch((e) => logger.error('Error while reloading cache', e));
    return h.response({}).code(202);
  },

  refreshCacheEntry(request) {
    const updatedRecord = request.payload;
    const recordId = request.params.id;
    const datasource =
      LearningContentDatasources[_.findKey(LearningContentDatasources, { modelName: request.params.model })];
    return datasource.refreshLearningContentCacheRecord(recordId, updatedRecord).then(() => null);
  },
};

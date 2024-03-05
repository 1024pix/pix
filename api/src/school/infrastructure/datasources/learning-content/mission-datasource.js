import * as datasource from '../../../../shared/infrastructure/datasources/learning-content/datasource.js';

const missionDatasource = datasource.extend({
  modelName: 'missions',
});

export { missionDatasource };

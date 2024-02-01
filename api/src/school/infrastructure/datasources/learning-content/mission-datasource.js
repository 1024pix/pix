import * as datasource from '../../../../../lib/infrastructure/datasources/learning-content/datasource.js';

const missionDatasource = datasource.extend({
  modelName: 'missions',
});

export { missionDatasource };

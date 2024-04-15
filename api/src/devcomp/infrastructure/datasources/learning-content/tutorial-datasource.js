import _ from 'lodash';

import * as datasource from '../../../../shared/infrastructure/datasources/learning-content/datasource.js';

const tutorialDatasource = datasource.extend({
  modelName: 'tutorials',

  async findByRecordIds(tutorialRecordIds) {
    const tutorials = await this.list();
    return tutorials.filter((tutorialData) => _.includes(tutorialRecordIds, tutorialData.id));
  },
});
export { tutorialDatasource };

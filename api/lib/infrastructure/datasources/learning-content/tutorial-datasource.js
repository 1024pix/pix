const _ = require('lodash');
const datasource = require('./datasource.js');

const tutorialDatasource = datasource.extend({
  modelName: 'tutorials',

  async findByRecordIds(tutorialRecordIds) {
    const tutorials = await this.list();
    return tutorials.filter((tutorialData) => _.includes(tutorialRecordIds, tutorialData.id));
  },
});
module.exports = { tutorialDatasource };

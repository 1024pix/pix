const _ = require('lodash');
const datasource = require('./datasource.js');

module.exports = datasource.extend({
  modelName: 'tutorials',

  async findByRecordIds(tutorialRecordIds) {
    const tutorials = await this.list();
    return tutorials.filter((tutorialData) => _.includes(tutorialRecordIds, tutorialData.id));
  },
});

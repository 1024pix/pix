const _ = require('lodash');
const datasource = require('./datasource.js');

module.exports = datasource.extend({
  modelName: 'tubes',

  async findByNames(tubeNames) {
    const tubes = await this.list();
    return tubes.filter((tubeData) => _.includes(tubeNames, tubeData.name));
  },

  async findByRecordIds(tubeIds) {
    const tubes = await this.list();
    return tubes.filter(({ id }) => tubeIds.includes(id));
  },
});

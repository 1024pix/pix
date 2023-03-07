const datasource = require('./datasource.js');

const frameworkDatasource = datasource.extend({
  modelName: 'frameworks',

  async getByName(frameworkName) {
    const framework = await this.list();
    return framework.find((frameworkData) => frameworkName === frameworkData.name);
  },

  async findByRecordIds(frameworkIds) {
    const frameworks = await this.list();
    return frameworks.filter(({ id }) => frameworkIds.includes(id));
  },
});

module.exports = { frameworkDatasource };

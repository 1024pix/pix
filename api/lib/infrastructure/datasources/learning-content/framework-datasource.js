const datasource = require('./datasource.js');

module.exports = datasource.extend({
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

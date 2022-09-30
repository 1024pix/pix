const datasource = require('./datasource');

module.exports = datasource.extend({
  modelName: 'frameworks',

  async getByName(frameworkName) {
    const framework = await this.list();
    return framework.find((frameworkData) => frameworkName === frameworkData.name);
  },
  async getById(frameworkId) {
    const framework = await this.list();
    return framework.find((frameworkData) => frameworkId === frameworkData.id);
  },
});

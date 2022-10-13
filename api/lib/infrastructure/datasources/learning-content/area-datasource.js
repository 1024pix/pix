const datasource = require('./datasource');

module.exports = datasource.extend({
  modelName: 'areas',

  async findByFrameworkId(frameworkId) {
    const areas = await this.list();
    return areas.filter((area) => area.frameworkId === frameworkId);
  },
});

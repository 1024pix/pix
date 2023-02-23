const datasource = require('./datasource.js');

module.exports = datasource.extend({
  modelName: 'areas',

  async findByRecordIds(areaIds) {
    const areas = await this.list();
    return areas.filter(({ id }) => areaIds.includes(id));
  },

  async findByFrameworkId(frameworkId) {
    const areas = await this.list();
    return areas.filter((area) => area.frameworkId === frameworkId);
  },
});

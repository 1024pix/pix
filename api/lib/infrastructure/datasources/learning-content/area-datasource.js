const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'areas',

  async findByRecordIds(areaIds) {
    const areas = await this.list();
    return areas.filter(({ id }) => areaIds.includes(id));
  },

});


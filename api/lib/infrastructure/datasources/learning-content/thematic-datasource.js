const datasource = require('./datasource.js');

const thematicDatasource = datasource.extend({
  modelName: 'thematics',

  async findByCompetenceIds(competenceIds) {
    const thematics = await this.list();
    return thematics.filter((thematic) => competenceIds.includes(thematic.competenceId));
  },

  async findByRecordIds(thematicIds) {
    const thematics = await this.list();
    return thematics.filter(({ id }) => thematicIds.includes(id));
  },
});

module.exports = { thematicDatasource };

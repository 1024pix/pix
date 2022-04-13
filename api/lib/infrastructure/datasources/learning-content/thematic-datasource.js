const datasource = require('./datasource');

module.exports = datasource.extend({
  modelName: 'thematics',

  async findByCompetenceIds(competenceIds) {
    const thematics = await this.list();
    return thematics.filter((thematic) => competenceIds.includes(thematic.competenceId));
  },
});

const datasource = require('./datasource');

module.exports = datasource.extend({
  modelName: 'thematics',

  async findByCompetenceId(competenceId) {
    const thematics = await this.list();
    return thematics.filter((thematic) => thematic.competenceId === competenceId);
  },
});

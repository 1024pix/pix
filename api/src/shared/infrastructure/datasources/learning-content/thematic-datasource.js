import * as datasource from '../../../../../lib/infrastructure/datasources/learning-content/datasource.js';

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

export { thematicDatasource };

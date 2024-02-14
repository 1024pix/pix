import * as datasource from './datasource.js';
const areaDatasource = datasource.extend({
  modelName: 'areas',

  async findByRecordIds(areaIds) {
    const areas = await this.list();
    return areas.filter(({ id }) => areaIds.includes(id));
  },

  async findByFrameworkId(frameworkId) {
    const areas = await this.list();
    return areas.filter((area) => area.frameworkId === frameworkId);
  },

  async findOneFromCompetenceId(competenceId) {
    const areas = await this.list();
    const area = areas.filter((area) => area.competenceIds?.includes(competenceId));
    return area.length > 0 ? area[0] : {};
  },
});

export { areaDatasource };

import * as datasource from './datasource.js';

const competenceDatasource = datasource.extend({
  modelName: 'competences',

  async findByRecordIds(competenceIds) {
    const competences = await this.list();
    return competences.filter(({ id }) => competenceIds.includes(id));
  },
});

export { competenceDatasource };

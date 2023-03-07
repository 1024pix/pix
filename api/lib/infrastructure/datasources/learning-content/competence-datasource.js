const datasource = require('./datasource.js');

const competenceDatasource = datasource.extend({
  modelName: 'competences',

  async findByRecordIds(competenceIds) {
    const competences = await this.list();
    return competences.filter(({ id }) => competenceIds.includes(id));
  },
});

module.exports = { competenceDatasource };

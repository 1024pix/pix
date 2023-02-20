import datasource from './datasource';

export default datasource.extend({
  modelName: 'competences',

  async findByRecordIds(competenceIds) {
    const competences = await this.list();
    return competences.filter(({ id }) => competenceIds.includes(id));
  },
});

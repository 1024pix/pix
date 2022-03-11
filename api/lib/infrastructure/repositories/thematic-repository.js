const Thematic = require('../../domain/models/Thematic');
const thematicDatasource = require('../datasources/learning-content/thematic-datasource');

function _toDomain(thematicData) {
  return new Thematic({
    id: thematicData.id,
    name: thematicData.name,
    index: thematicData.index,
    tubeIds: thematicData.tubeIds,
  });
}

module.exports = {
  async list() {
    const thematicData = await thematicDatasource.list();
    return thematicData.map(_toDomain);
  },

  async findByCompetenceId(competenceId) {
    const thematicDatas = await thematicDatasource.findByCompetenceId(competenceId);
    return thematicDatas.map(_toDomain);
  },
};
